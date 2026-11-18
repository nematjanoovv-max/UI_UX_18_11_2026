import zipfile
import hashlib
import base64
import os
import struct
import datetime
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs7

unsigned_apk = "/mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/build/unsigned.apk"
signed_apk = "/mnt/sdcard/Agent/UI_UX_18_11_2026/TowerDefense_LastGrid_v3.5.0.apk"

def b64(data):
    return base64.b64encode(data).decode('ascii')

def sha256(data):
    return hashlib.sha256(data).digest()

with zipfile.ZipFile(unsigned_apk, 'r') as zin:
    file_entries = {}
    manifest_lines = ["Manifest-Version: 1.0\r\nCreated-By: 1.0 (Android Signer)\r\n\r\n"]
    sf_lines = ["Signature-Version: 1.0\r\nCreated-By: 1.0 (Android Signer)\r\n"]

    manifest_sections = {}

    for info in zin.infolist():
        if info.filename.startswith("META-INF/"):
            continue
        data = zin.read(info.filename)
        file_entries[info.filename] = (info, data)

        digest = b64(sha256(data))
        section = f"Name: {info.filename}\r\nSHA-256-Digest: {digest}\r\n\r\n"
        manifest_sections[info.filename] = section
        manifest_lines.append(section)

    manifest_bytes = "".join(manifest_lines).encode('utf-8')
    manifest_digest = b64(sha256(manifest_bytes))
    sf_lines.append(f"SHA-256-Digest-Manifest: {manifest_digest}\r\n\r\n")

    for filename, section in manifest_sections.items():
        sec_digest = b64(sha256(section.encode('utf-8')))
        sf_lines.append(f"Name: {filename}\r\nSHA-256-Digest: {sec_digest}\r\n\r\n")

    sf_bytes = "".join(sf_lines).encode('utf-8')

# Generate RSA Key & Self-Signed Cert
key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
subject = issuer = x509.Name([
    x509.NameAttribute(x509.NameOID.COMMON_NAME, "LastGridTD"),
    x509.NameAttribute(x509.NameOID.ORGANIZATION_NAME, "LastGridTD"),
    x509.NameAttribute(x509.NameOID.COUNTRY_NAME, "UZ")
])
cert = (
    x509.CertificateBuilder()
    .subject_name(subject)
    .issuer_name(issuer)
    .public_key(key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1))
    .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=10000))
    .sign(key, hashes.SHA256())
)

builder = pkcs7.PKCS7SignatureBuilder().set_data(sf_bytes)
builder = builder.add_signer(cert, key, hashes.SHA256())
rsa_bytes = builder.sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.DetachedSignature])

# Write signed APK
with zipfile.ZipFile(signed_apk, 'w') as zout:
    # 1. META-INF files first
    zout.writestr("META-INF/MANIFEST.MF", manifest_bytes, compress_type=zipfile.ZIP_DEFLATED)
    zout.writestr("META-INF/CERT.SF", sf_bytes, compress_type=zipfile.ZIP_DEFLATED)
    zout.writestr("META-INF/CERT.RSA", rsa_bytes, compress_type=zipfile.ZIP_STORED)

    # 2. All contents
    with zipfile.ZipFile(unsigned_apk, 'r') as zin:
        for info in zin.infolist():
            if info.filename.startswith("META-INF/"):
                continue
            data = zin.read(info.filename)
            # resources.arsc and uncompressed assets can be stored or deflated
            comp = zipfile.ZIP_STORED if info.filename.endswith(".arsc") or info.filename.endswith(".png") else zipfile.ZIP_DEFLATED
            zout.writestr(info.filename, data, compress_type=comp)

print(f"Generated signed APK: {signed_apk}, size: {os.path.getsize(signed_apk)} bytes")
