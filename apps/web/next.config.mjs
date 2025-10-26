/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore React Native modules used by MetaMask SDK in web builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };
    
    // Suppress warnings for React Native modules
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@metamask\/sdk/,
        message: /Can't resolve '@react-native-async-storage\/async-storage'/,
      },
    ];
    
    return config;
  },
};

export default nextConfig;
