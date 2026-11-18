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
import java.io.InputStream;
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

        setImmersiveMode();

        try {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        } catch (Exception e) {}

        webView = new WebView(this);
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

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                setImmersiveMode();
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    Uri uri = request.getUrl();
                    String path = uri.getPath();
                    if (path != null) {
                        String assetPath = null;
                        if (path.startsWith("/android_asset/")) {
                            assetPath = path.substring("/android_asset/".length());
                        } else if (path.equals("/") || path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".json") || path.endsWith(".png") || path.endsWith(".svg") || path.endsWith(".css")) {
                            assetPath = "www" + (path.startsWith("/") ? path : "/" + path);
                            if (assetPath.equals("www/")) assetPath = "www/index.html";
                        }
                        if (assetPath != null) {
                            try {
                                InputStream is = getAssets().open(assetPath);
                                String mime = "text/plain";
                                if (assetPath.endsWith(".html")) mime = "text/html";
                                else if (assetPath.endsWith(".js")) mime = "application/javascript";
                                else if (assetPath.endsWith(".css")) mime = "text/css";
                                else if (assetPath.endsWith(".json")) mime = "application/json";
                                else if (assetPath.endsWith(".png")) mime = "image/png";
                                else if (assetPath.endsWith(".svg")) mime = "image/svg+xml";
                                return new WebResourceResponse(mime, "UTF-8", is);
                            } catch (Exception e) {}
                        }
                    }
                }
                return super.shouldInterceptRequest(view, request);
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
                "if (window.lastGridEngine && window.lastGridEngine.state !== 'MENU') { " +
                "  window.lastGridEngine.state = 'MENU'; " +
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
            finishAndRemoveTask();
        }

        @JavascriptInterface
        public String getVersion() {
            return "3.5.0-android-apk";
        }

        @JavascriptInterface
        public String getPlatform() {
            return "android-apk";
        }
    }
}
