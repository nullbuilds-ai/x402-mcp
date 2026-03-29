#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { discoverPaidServices, discoverSchema } from "./tools/discover.js";
import { getServiceDetails, detailsSchema } from "./tools/details.js";
import { estimatePayment, estimateSchema } from "./tools/estimate.js";
import { checkWalletBalance, balanceSchema } from "./tools/balance.js";
import { makeX402Request, requestSchema } from "./tools/request.js";
import { getMyWallet } from "./tools/wallet-info.js";
import { getPaymentHistory, historySchema } from "./tools/history.js";
const server = new Server({ name: "x402-mcp", version: "0.4.0" }, { capabilities: { tools: {} } });
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
        {
            name: "make_x402_request",
            description: "Pay and call an x402-enabled API using your CDP wallet. Handles payment automatically. Returns the actual API response. Requires CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET in env.",
            inputSchema: {
                type: "object",
                properties: {
                    resource_url: { type: "string", description: "URL of the x402 API to call" },
                    method: { type: "string", enum: ["GET", "POST"], description: "HTTP method (default GET)" },
                    body: { type: "string", description: "JSON body for POST requests" },
                    max_cost_usdc: {
                        type: "number",
                        description: "Maximum USDC cost to allow (default 1.0). Request aborts if cost exceeds this.",
                    },
                },
                required: ["resource_url"],
            },
        },
        {
            name: "get_my_wallet",
            description: "Return your x402-mcp CDP wallet address. Use this to find out where to send USDC before making paid API calls. Requires CDP credentials.",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "get_payment_history",
            description: "Show your recent x402 payment history — what APIs you called, how much you paid, and whether each succeeded.",
            inputSchema: {
                type: "object",
                properties: {
                    limit: { type: "number", description: "Number of records to return (1-100, default 20)" },
                },
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
            case "make_x402_request": {
                const input = requestSchema.parse(args);
                result = await makeX402Request(input);
                break;
            }
            case "get_my_wallet": {
                result = await getMyWallet();
                break;
            }
            case "get_payment_history": {
                const input = historySchema.parse(args);
                result = await getPaymentHistory(input);
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
