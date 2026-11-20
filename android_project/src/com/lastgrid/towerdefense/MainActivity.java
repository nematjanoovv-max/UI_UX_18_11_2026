package com.lastgrid.towerdefense;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;

public class MainActivity extends Activity {
    private WebView webView;
    private Vibrator vibrator;
    private boolean hapticsEnabled = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        setImmersiveMode();

        try {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        } catch (Exception e) {}

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF05070D);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
                android.util.Log.d("LastGridJS", consoleMessage.message() + " -- Line " + consoleMessage.lineNumber());
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                setImmersiveMode();
            }

            private WebResourceResponse handleIntercept(String urlStr) {
                if (urlStr == null) return null;
                try {
                    Uri uri = Uri.parse(urlStr);
                    String path = uri.getPath();
                    if (path != null) {
                        String assetPath = null;
                        if (path.startsWith("/android_asset/")) {
                            assetPath = path.substring("/android_asset/".length());
                        } else if (path.equals("/") || path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".json") || path.endsWith(".png") || path.endsWith(".svg") || path.endsWith(".css") || path.endsWith(".mp3") || path.endsWith(".wav") || path.endsWith(".glb") || path.endsWith(".wasm") || path.endsWith(".webp") || path.endsWith(".pck")) {
                            assetPath = "www" + (path.startsWith("/") ? path : "/" + path);
                            if (assetPath.equals("www/")) assetPath = "www/index.html";
                        }
                        if (assetPath != null) {
                            InputStream is = getAssets().open(assetPath);
                            String mime = "text/plain";
                            if (assetPath.endsWith(".html")) mime = "text/html";
                            else if (assetPath.endsWith(".js")) mime = "application/javascript";
                            else if (assetPath.endsWith(".css")) mime = "text/css";
                            else if (assetPath.endsWith(".json")) mime = "application/json";
                            else if (assetPath.endsWith(".png")) mime = "image/png";
                            else if (assetPath.endsWith(".svg")) mime = "image/svg+xml";
                            else if (assetPath.endsWith(".mp3")) mime = "audio/mpeg";
                            else if (assetPath.endsWith(".wav")) mime = "audio/wav";
                            else if (assetPath.endsWith(".glb")) mime = "model/gltf-binary";
                            else if (assetPath.endsWith(".wasm")) mime = "application/wasm";
                            else if (assetPath.endsWith(".webp")) mime = "image/webp";
                            else if (assetPath.endsWith(".pck")) mime = "application/octet-stream";
                            String encoding = (assetPath.endsWith(".html") || assetPath.endsWith(".js") || assetPath.endsWith(".css") || assetPath.endsWith(".json")) ? "UTF-8" : null;
                            WebResourceResponse response = new WebResourceResponse(mime, encoding, is);
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                Map<String, String> headers = new HashMap<>();
                                headers.put("Access-Control-Allow-Origin", "*");
                                headers.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
                                headers.put("Access-Control-Allow-Headers", "*");
                                response.setResponseHeaders(headers);
                            }
                            return response;
                        }
                    }
                } catch (Exception e) {
                    android.util.Log.e("LastGridAsset", "Error opening asset from " + urlStr + ": " + e.getMessage());
                }
                return null;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    WebResourceResponse resp = handleIntercept(request.getUrl().toString());
                    if (resp != null) return resp;
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                WebResourceResponse resp = handleIntercept(url);
                if (resp != null) return resp;
                return super.shouldInterceptRequest(view, url);
            }
        });

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        // Load 100% offline local assets
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void setImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        setImmersiveMode();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            setImmersiveMode();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "if (window.lastGridEngine && typeof window.lastGridEngine.handleBackAction === 'function') { " +
                "  window.lastGridEngine.handleBackAction(); " +
                "} else { " +
                "  window.AndroidBridge.exitApp(); " +
                "}", null);
        } else {
            super.onBackPressed();
        }
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void vibrate(String patternStr) {
            if (!hapticsEnabled || vibrator == null || !vibrator.hasVibrator()) return;
            try {
                if (patternStr.startsWith("[")) {
                    JSONArray arr = new JSONArray(patternStr);
                    long[] pattern = new long[arr.length()];
                    for (int i = 0; i < arr.length(); i++) {
                        pattern[i] = arr.getLong(i);
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                    } else {
                        vibrator.vibrate(pattern, -1);
                    }
                } else {
                    long ms = Long.parseLong(patternStr);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        vibrator.vibrate(ms);
                    }
                }
            } catch (Exception e) {}
        }

        @JavascriptInterface
        public void setHapticsEnabled(boolean enabled) {
            hapticsEnabled = enabled;
        }

        @JavascriptInterface
        public boolean isHapticsEnabled() {
            return hapticsEnabled;
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finishAndRemoveTask();
                }
            });
        }

        @JavascriptInterface
        public String getVersion() {
            return "4.2.0-android-apk";
        }

        @JavascriptInterface
        public String getMegatronModelBase64() {
            try {
                InputStream is = getAssets().open("www/assets/models/megatron.glb");
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                byte[] data = new byte[65536];
                int nRead;
                while ((nRead = is.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, nRead);
                }
                buffer.flush();
                return android.util.Base64.encodeToString(buffer.toByteArray(), android.util.Base64.NO_WRAP);
            } catch (Exception e) {
                android.util.Log.e("LastGridBridge", "Error reading megatron.glb via bridge: " + e.getMessage());
                return "";
            }
        }

        @JavascriptInterface
        public String getPlatform() {
            return "android-apk";
        }
    }
}
