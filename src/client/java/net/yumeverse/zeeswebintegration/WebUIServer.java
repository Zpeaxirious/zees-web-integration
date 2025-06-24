package net.yumeverse.zeeswebintegration;

import fi.iki.elonen.NanoHTTPD;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.ClientPlayerEntity;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

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
                case "/style.css" -> serveStatic("web/style.css", "text/css");
                case "/script.js" -> serveStatic("web/script.js", "application/javascript");
                case "/player" -> servePlayerData();
                default -> newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
            };
        } catch (IOException e) {
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Server error.");
        }
    }

    private Response serveStatic(String path, String mime) throws IOException {
        InputStream stream = getClass().getClassLoader().getResourceAsStream(path);
        if (stream == null) return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found.");
        String content = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        return newFixedLengthResponse(Response.Status.OK, mime, content);
    }

    private Response servePlayerData() {
        ClientPlayerEntity player = MinecraftClient.getInstance().player;
        if (player == null) {
            return newFixedLengthResponse(Response.Status.OK, "application/json", "{\"error\": \"Player not loaded\"}");
        }

        String biomeName = "unknown";
        if (player.getWorld() != null) {
            var biomeKey = player.getWorld().getBiome(player.getBlockPos()).getKey();
            if (biomeKey.isPresent()) {
                biomeName = biomeKey.get().getValue().toString();
            }
        }

        float health = player.getHealth();
        int hunger = player.getHungerManager().getFoodLevel();
        float saturation = player.getHungerManager().getSaturationLevel();

        String json = String.format(
                "{\"name\": \"%s\", \"health\": %.1f, \"hunger\": %d, \"saturation\": %.1f, \"x\": %.2f, \"y\": %.2f, \"z\": %.2f, \"biome\": \"%s\"}",
                player.getName().getString(),
                health,
                hunger,
                saturation,
                player.getX(), player.getY(), player.getZ(),
                biomeName
        );

        return newFixedLengthResponse(Response.Status.OK, "application/json", json);
    }
}
