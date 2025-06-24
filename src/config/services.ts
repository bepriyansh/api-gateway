import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { config } from ".";
import { ProxyErrorResponse, ServiceConfig } from "../types";
import logger from "./logger";
import { Application } from "express";
import { verifyToken } from "../middlewares/verification";

class ProxyService {
    private static readonly serviceConfigs : ServiceConfig[] = [
        {
            path: "/api/v1/auth",
            url: config.AUTH_SERVICE_URL,
            pathRewrite: {"^/": "/api/v1/auth/"},
            name: "auth-service",
            timeout: 5000
        },
        {
            path: "/api/v1/post",
            url: config.POST_SERVICE_URL,
            pathRewrite: {"^/": "/api/v1/post/"},
            name: "post-service",
            timeout: 5000
        },
    ]

    private static createProxyOptions(service: ServiceConfig) : Options {
        return {
            target: service.url,
            changeOrigin: true,
            pathRewrite: service.pathRewrite,
            timeout: service.timeout || config.DEFAULT_TIMEOUT,
            logger: logger,
            on: {
                error: this.handleProxyError,
                proxyReq: this.handleProxyRequest,
                proxyRes: this.handleProxyResponse,
            }
        };
    }

    private static handleProxyError(err: Error, req: any, res: any): void {
        logger.error(`Proxy error for ${req.path}: `, err.message);

        const errorResponse: ProxyErrorResponse = {
            message: "Service Unavailable",
            status: 503,
            timestamp: new Date().toISOString(),
        }

        res.status(503).setHeader("Content-Type", "application/json").end(JSON.stringify(errorResponse));
    };

    private static handleProxyRequest(proxyReq: any, req: any): void {
        // logger.debug(`Proxying request to ${req.path}`);
    }

    private static handleProxyResponse(proxyRes: any, req: any): void {
        // logger.debug(`Received response for ${req.path}`);
    }

    public static setUpProxy(app: Application): void {
        this.serviceConfigs.forEach((service)=>{
            const proxyOptions = this.createProxyOptions(service);
            if (service.name === "auth-service"){
                app.use(service.path, createProxyMiddleware(proxyOptions));
            }
            app.use(service.path, verifyToken, createProxyMiddleware(proxyOptions));
            logger.info(`Configured proxy for ${service.name} at ${service.path}`);
        })
    }
}

export const proxyServices = (app: Application): void => {
    ProxyService.setUpProxy(app);
}