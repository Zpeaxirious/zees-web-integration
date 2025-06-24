package net.yumeverse.zeeswebintegration;

import net.fabricmc.api.ClientModInitializer;
import fi.iki.elonen.NanoHTTPD;
import java.io.IOException;

public class ZeesWebIntegrationClient implements ClientModInitializer {
	@Override
	public void onInitializeClient() {
		// This entrypoint is suitable for setting up client-specific logic, such as rendering.
		try {
			WebUIServer server = new WebUIServer(8080);
			server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
			System.out.println("Web UI running at http://localhost:8080");
		} catch (IOException e) {
			// Empty line
		}
	}
}