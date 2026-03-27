#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { discoverPaidServices, discoverSchema } from "./tools/discover.js";
import { getServiceDetails, detailsSchema } from "./tools/details.js";
import { estimatePayment, estimateSchema } from "./tools/estimate.js";
import { checkWalletBalance, balanceSchema } from "./tools/balance.js";
const server = new Server({ name: "x402-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
        {
            name: "discover_paid_services",
            description: "Browse the x402 Bazaar catalog of paid API services. Returns services with their cost, network, and endpoint URL. Filter by search query or blockchain network.",
            inputSchema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Search term (name, description, URL)" },
                    network: { type: "string", description: "Filter by network: 'base', 'solana', 'ethereum', 'polygon'" },
                    limit: { type: "number", description: "Max results (1-100, default 20)" },
                    offset: { type: "number", description: "Pagination offset (default 0)" },
                },
            },
        },
        {
            name: "get_service_details",
            description: "Get full payment requirements for a specific x402-enabled service URL, including all payment options, networks, and pricing.",
            inputSchema: {
                type: "object",
                properties: {
                    resource_url: { type: "string", description: "Exact URL of the x402 resource" },
                },
                required: ["resource_url"],
            },
        },
        {
            name: "estimate_payment",
            description: "Probe a URL and return its x402 payment requirements without making any payment. Shows cost, network, and recipient address.",
            inputSchema: {
                type: "object",
                properties: {
                    resource_url: { type: "string", description: "URL to probe for x402 payment requirements" },
                    method: { type: "string", enum: ["GET", "POST"], description: "HTTP method (default GET)" },
                },
                required: ["resource_url"],
            },
        },
        {
            name: "check_wallet_balance",
            description: "Check the USDC balance of a wallet address on Base. Read-only — no private key required.",
            inputSchema: {
                type: "object",
                properties: {
                    wallet_address: { type: "string", description: "Wallet address (0x...) or ENS name" },
                },
                required: ["wallet_address"],
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
        let result;
        switch (name) {
            case "discover_paid_services": {
                const input = discoverSchema.parse(args);
                result = await discoverPaidServices(input);
                break;
            }
            case "get_service_details": {
                const input = detailsSchema.parse(args);
                result = await getServiceDetails(input);
                break;
            }
            case "estimate_payment": {
                const input = estimateSchema.parse(args);
                result = await estimatePayment(input);
                break;
            }
            case "check_wallet_balance": {
                const input = balanceSchema.parse(args);
                result = await checkWalletBalance(input);
                break;
            }
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
        return { content: [{ type: "text", text: result }] };
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return {
                content: [{ type: "text", text: `Invalid input: ${err.message}` }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
