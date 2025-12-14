import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '';

if (!projectId) {
    console.warn('Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable');
}

export const config = getDefaultConfig({
    appName: 'NEXUS PayStream',
    projectId,
    chains: [polygon],
    transports: {
        [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com'),
    },
    ssr: false,
});

export { polygon };
