"""
Hugging Face Dynamic Space Discovery Module
Inspects live Hugging Face spaces using gradio_client.view_api()
Dynamically determines endpoints, input parameters, and availability without hardcoding.
"""

import os
import sys
import json
from typing import Dict, Any, Optional, Tuple

try:
    import gradio_client
except ImportError:
    gradio_client = None

CANDIDATE_SPACES = {
    "concept": [
        "black-forest-labs/FLUX.1-schnell",
        "mrfakename/FLUX.1-schnell",
        "multimodalart/flux-tarot",
    ],
    "mesh": [
        "tencent/Hunyuan3D-2.1",
        "tencent/Hunyuan3D-2",
        "trellis-community/TRELLIS",
    ],
    "rig": [
        "jasongzy/Make-It-Animatable",
        "MohamedRashad/UniRig",
        "monaverse/UniRig",
    ]
}


def log(msg: str) -> None:
    sys.stderr.write(f"[HF_DISCOVERY] {msg}\n")
    sys.stderr.flush()


def get_hf_token() -> Optional[str]:
    return os.getenv("HF_TOKEN")


def inspect_space(space_id: str, token: Optional[str] = None) -> Dict[str, Any]:
    if gradio_client is None:
        return {"status": "error", "error": "gradio_client not installed"}
    
    if token is None:
        token = get_hf_token()
        
    try:
        log(f"Connecting to {space_id}...")
        client = gradio_client.Client(space_id, token=token, verbose=False)
        api_dict = client.view_api(return_format="dict")
        named_endpoints = api_dict.get("named_endpoints", {})
        endpoints_info = {}
        for ep_name, ep_details in named_endpoints.items():
            parameters = []
            for p in ep_details.get("parameters", []):
                parameters.append({
                    "name": p.get("parameter_name") or p.get("label"),
                    "type": p.get("type"),
                    "required": p.get("parameter_has_default") is False or p.get("default") is None,
                    "default": p.get("default")
                })
            endpoints_info[ep_name] = {
                "parameters": parameters,
                "returns": [r.get("type") for r in ep_details.get("returns", [])]
            }
        log(f"Connected to {space_id}: {len(endpoints_info)} endpoints found")
        return {
            "status": "online",
            "space_id": space_id,
            "endpoints": list(endpoints_info.keys()),
            "details": endpoints_info
        }
    except Exception as e:
        log(f"Failed to connect to {space_id}: {type(e).__name__}: {str(e)[:120]}")
        return {
            "status": "offline_or_error",
            "space_id": space_id,
            "error": f"{type(e).__name__}: {str(e)}"
        }


def discover_all(token: Optional[str] = None) -> Dict[str, Any]:
    if token is None:
        token = get_hf_token()
    results = {}
    for category, space_list in CANDIDATE_SPACES.items():
        results[category] = {}
        for space_id in space_list:
            results[category][space_id] = inspect_space(space_id, token)
    return results


def find_best_space(category: str, token: Optional[str] = None) -> Tuple[Optional[str], Optional[Any], Optional[str], Optional[Dict[str, Any]]]:
    """
    Returns (space_id, client, endpoint_name, endpoint_details) for the first working space in category.
    """
    if token is None:
        token = get_hf_token()
    space_list = CANDIDATE_SPACES.get(category, [])
    for space_id in space_list:
        try:
            client = gradio_client.Client(space_id, token=token, verbose=False)
            api_dict = client.view_api(return_format="dict")
            named_endpoints = api_dict.get("named_endpoints", {})
            if not named_endpoints:
                continue
            
            # Select appropriate endpoint by category
            chosen_ep = None
            if category == "concept":
                if "/infer" in named_endpoints:
                    chosen_ep = "/infer"
                elif "/predict" in named_endpoints:
                    chosen_ep = "/predict"
                else:
                    chosen_ep = list(named_endpoints.keys())[0]
            elif category == "mesh":
                if "/generation_all" in named_endpoints:
                    chosen_ep = "/generation_all"
                elif "/generate_and_extract_glb" in named_endpoints:
                    chosen_ep = "/generate_and_extract_glb"
                elif "/shape_generation" in named_endpoints:
                    chosen_ep = "/shape_generation"
                else:
                    chosen_ep = list(named_endpoints.keys())[0]
            elif category == "rig":
                # Check for rigging endpoint
                for ep in ["/rig", "/auto_rig", "/predict", "/generate"]:
                    if ep in named_endpoints:
                        chosen_ep = ep
                        break
                if not chosen_ep and named_endpoints:
                    chosen_ep = list(named_endpoints.keys())[0]
            
            if chosen_ep:
                log(f"Selected best {category} space: {space_id} endpoint: {chosen_ep}")
                return space_id, client, chosen_ep, named_endpoints[chosen_ep]
        except Exception as e:
            log(f"Skipping {space_id} due to error: {e}")
            continue
    return None, None, None, None


if __name__ == "__main__":
    token = get_hf_token()
    token_status = "present" if token else "missing (anonymous mode)"
    log(f"Running discovery with HF_TOKEN {token_status}")
    res = discover_all(token)
    print(json.dumps(res, indent=2))
