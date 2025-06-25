package net.yumeverse.zeeswebintegration;

import fi.iki.elonen.NanoHTTPD;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ClientPlayerEntity;

import java.io.IOException;
import java.io.InputStream;

public class WebUIServer extends NanoHTTPD {

    public WebUIServer(int port) {
        super(port);
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        try {
            return switch (uri) {
                case "/", "/index.html" -> serveStatic("web/index.html", "text/html");
                case "/script.js" -> serveStatic("web/script.js", "application/javascript");
                case "/resources/css/style.css" -> serveStatic("web/resources/css/style.css", "text/css");
                case "/resources/css/marked.css" -> serveStatic("web/resources/css/marked.css", "text/css");
                case "/resources/icon.png" -> serveStatic("web/resources/icon.png", "image/png");
                case "/resources/background.png" -> serveStatic("web/resources/background.png", "image/png");
                case "/resources/fonts/font1.ttf" -> serveStatic("web/resources/fonts/font1.ttf", "application/font-x-font");
                case "/player" -> servePlayerData();
                default -> newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
            };
        } catch (IOException e) {
            e.printStackTrace();
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Server error.");
        }
    }

    private Response serveStatic(String path, String mime) throws IOException {
        InputStream stream = getClass().getClassLoader().getResourceAsStream(path);
        if (stream == null) {
            System.err.println("❌ Resource not found: " + path);
            return newFixedLengthResponse(Response.Status.NOT_FOUND,
                    "text/plain", "Not found.");
        }
        // Stream raw bytes—good for binary or text
        return newFixedLengthResponse(Response.Status.OK, mime, stream, -1);
    }

    private Response servePlayerData() {
        ClientPlayerEntity player = MinecraftClient.getInstance().player;
        if (player == null) {
            return newFixedLengthResponse(Response.Status.OK,
                    "application/json",
                    "{\"error\":\"Player not loaded\"}");
        }

        String biome = "unknown";
        if (player.getWorld() != null) {
            var biomeKey = player.getWorld()
                    .getBiome(player.getBlockPos())
                    .getKey();
            if (biomeKey.isPresent()) {
                biome = biomeKey.get().getValue().toString();
            }
        }

        String json = String.format(
                "{\"name\":\"%s\",\"health\":%.1f,\"hunger\":%d,\"saturation\":%.1f,"
                        + "\"x\":%.2f,\"y\":%.2f,\"z\":%.2f,\"biome\":\"%s\"}",
                player.getName().getString(),
                player.getHealth(),
                player.getHungerManager().getFoodLevel(),
                player.getHungerManager().getSaturationLevel(),
                player.getX(), player.getY(), player.getZ(),
                biome
        );

        return newFixedLengthResponse(Response.Status.OK,
                "application/json",
                json);
    }
}
