'use client';

import React, { useState } from 'react';
import { 
  FaGlobe, 
  FaCopy, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaCode,
  FaServer,
  FaCloud,
  FaShieldAlt,
  FaQuestionCircle
} from 'react-icons/fa';

interface DomainSetupGuideProps {
  portalName?: string;
}

const DomainSetupGuide: React.FC<DomainSetupGuideProps> = ({ portalName = 'your-portal' }) => {
  const [activeProvider, setActiveProvider] = useState<string>('cloudflare');
  const [domainType, setDomainType] = useState<'subdomain' | 'path'>('subdomain');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const providers = [
    { id: 'cloudflare', name: 'Cloudflare', icon: FaCloud },
    { id: 'godaddy', name: 'GoDaddy', icon: FaGlobe },
    { id: 'namecheap', name: 'Namecheap', icon: FaServer },
    { id: 'route53', name: 'AWS Route 53', icon: FaShieldAlt }
  ];

  const getProviderInstructions = (provider: string) => {
    const instructions = {
      cloudflare: {
        steps: [
          'Log into your Cloudflare dashboard',
          'Select your domain from the overview page',
          'Click on the "DNS" tab',
          'Click "Add record"',
          'Select "CNAME" as the record type',
          'Enter your subdomain name (e.g., "cards")',
          'Enter "portals.cardwise.com" as the target',
          'Set proxy status to "Proxied" (orange cloud)',
          'Click "Save"'
        ],
        notes: [
          'Cloudflare automatically handles SSL certificates',
          'Changes typically propagate within 5 minutes',
          'The orange cloud provides additional security and performance'
        ]
      },
      godaddy: {
        steps: [
          'Log into your GoDaddy account',
          'Go to "My Products" → "DNS"',
          'Find your domain and click "Manage"',
          'Click "Add" to create a new record',
          'Select "CNAME" from the dropdown',
          'Enter your subdomain in the "Host" field',
          'Enter "portals.cardwise.com" in the "Points to" field',
          'Set TTL to 1 hour (3600 seconds)',
          'Click "Save"'
        ],
        notes: [
          'DNS changes can take up to 24 hours to propagate',
          'GoDaddy automatically adds the domain suffix',
          'You may need to wait before SSL activation'
        ]
      },
      namecheap: {
        steps: [
          'Log into your Namecheap account',
          'Go to "Domain List" and find your domain',
          'Click "Manage" next to your domain',
          'Navigate to "Advanced DNS"',
          'Click "Add New Record"',
          'Select "CNAME Record" from the dropdown',
          'Enter your subdomain in the "Host" field',
          'Enter "portals.cardwise.com" in the "Value" field',
          'Set TTL to "Automatic"',
          'Click the checkmark to save'
        ],
        notes: [
          'Changes typically take 30 minutes to 2 hours',
          'Use "@" for the root domain, subdomain name for subdomains',
          'SSL certificates are handled automatically'
        ]
      },
      route53: {
        steps: [
          'Open the AWS Route 53 console',
          'Select "Hosted zones" from the left navigation',
          'Click on your domain name',
          'Click "Create record"',
          'Enter your subdomain in the "Record name" field',
          'Select "CNAME" as the record type',
          'Enter "portals.cardwise.com" in the "Value" field',
          'Keep TTL as default (300 seconds)',
          'Click "Create records"'
        ],
        notes: [
          'Changes propagate globally within 60 seconds',
          'Route 53 provides excellent reliability and performance',
          'Consider using alias records for better performance'
        ]
      }
    };

    return instructions[provider as keyof typeof instructions] || instructions.cloudflare;
  };

  const currentInstructions = getProviderInstructions(activeProvider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <FaGlobe className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Custom Domain Setup Guide</h2>
        <p className="mt-2 text-gray-600">
          Connect your CardWise portal to your own domain in just a few steps
        </p>
      </div>

      {/* Domain Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Your Setup Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDomainType('subdomain')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              domainType === 'subdomain'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Subdomain</h4>
                <p className="text-sm text-gray-600">cards.yourwebsite.com</p>
              </div>
              {domainType === 'subdomain' && (
                <FaCheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="mt-2 text-xs text-left">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Recommended</span>
              <p className="mt-1 text-gray-500">Easiest setup, full control</p>
            </div>
          </button>

          <button
            onClick={() => setDomainType('path')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              domainType === 'path'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Path-based</h4>
                <p className="text-sm text-gray-600">yourwebsite.com/cards</p>
              </div>
              {domainType === 'path' && (
                <FaCheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="mt-2 text-xs text-left">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Advanced</span>
              <p className="mt-1 text-gray-500">Requires server config</p>
            </div>
          </button>
        </div>
      </div>

      {domainType === 'subdomain' && (
        <>
          {/* DNS Provider Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Your DNS Provider</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setActiveProvider(provider.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                    activeProvider === provider.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <provider.icon className="h-8 w-8 mb-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {providers.find(p => p.id === activeProvider)?.name} Setup Instructions
            </h3>
            
            <div className="space-y-4">
              {currentInstructions.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            {/* Important Notes */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-900">Important Notes</h4>
                  <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                    {currentInstructions.notes.map((note, index) => (
                      <li key={index}>• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Record Examples */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DNS Record Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CNAME Record</h4>
                <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-400">Type: CNAME</div>
                      <div className="text-green-400">Name: cards</div>
                      <div className="text-yellow-400">Value: portals.cardwise.com</div>
                      <div className="text-gray-400">TTL: 3600 (1 hour)</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard('cards CNAME portals.cardwise.com')}
                      className="text-green-300 hover:text-green-100"
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">TXT Record (for verification)</h4>
                <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-400">Type: TXT</div>
                      <div className="text-green-400">Name: _cardwise-verify.cards</div>
                      <div className="text-yellow-400">Value: cardwise-verify-abc123def456</div>
                      <div className="text-gray-400">TTL: 3600 (1 hour)</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard('_cardwise-verify.cards TXT cardwise-verify-abc123def456')}
                      className="text-green-300 hover:text-green-100"
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Note:</strong> Replace "cards" with your preferred subdomain name and use the actual verification token provided in your portal setup.</p>
            </div>
          </div>
        </>
      )}

      {domainType === 'path' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Path-based Setup (Advanced)</h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FaQuestionCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">Requires Server Configuration</h4>
                <p className="mt-1 text-sm text-green-800">
                  Path-based setup requires configuring your web server to proxy requests to CardWise. 
                  This option is for advanced users with server access.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Option 1: Nginx Configuration</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <pre className="text-sm">
{`location /cards {
    proxy_pass https://${portalName}.cardwise-preview.com;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`location /cards {\n    proxy_pass https://${portalName}.cardwise-preview.com;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto $scheme;\n}`)}
                  className="mt-2 text-green-300 hover:text-green-100 flex items-center"
                >
                  <FaCopy className="mr-2 h-4 w-4" />
                  Copy Nginx Config
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Option 2: Apache Configuration</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <pre className="text-sm">
{`ProxyPass /cards https://${portalName}.cardwise-preview.com/
ProxyPassReverse /cards https://${portalName}.cardwise-preview.com/
ProxyPreserveHost On`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`ProxyPass /cards https://${portalName}.cardwise-preview.com/\nProxyPassReverse /cards https://${portalName}.cardwise-preview.com/\nProxyPreserveHost On`)}
                  className="mt-2 text-green-300 hover:text-green-100 flex items-center"
                >
                  <FaCopy className="mr-2 h-4 w-4" />
                  Copy Apache Config
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Option 3: Cloudflare Workers</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <pre className="text-sm">
{`addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname.startsWith('/cards')) {
    const proxyUrl = 'https://${portalName}.cardwise-preview.com' + url.pathname + url.search
    return fetch(proxyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  return fetch(request)
}`}
                </pre>
                <button
                  onClick={() => copyToClipboard('/* Cloudflare Worker code */')}
                  className="mt-2 text-green-300 hover:text-green-100 flex items-center"
                >
                  <FaCopy className="mr-2 h-4 w-4" />
                  Copy Worker Code
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-900">Support Available</h4>
                <p className="mt-1 text-sm text-yellow-800">
                  Need help with server configuration? Contact our support team for assistance with path-based setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Verification & Testing</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">DNS Propagation Check</h4>
              <p className="text-gray-600">Use tools like dig or nslookup to verify your DNS records:</p>
              <div className="mt-2 bg-gray-100 p-2 rounded font-mono text-sm">
                dig cards.yourwebsite.com CNAME
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">SSL Certificate</h4>
              <p className="text-gray-600">SSL certificates are automatically provisioned within 24 hours of domain verification.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Portal Testing</h4>
              <p className="text-gray-600">Once DNS propagates, test your portal to ensure everything works correctly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Contact */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <FaQuestionCircle className="mx-auto h-8 w-8 text-green-600 mb-3" />
        <h3 className="font-medium text-green-900">Need Help?</h3>
        <p className="mt-1 text-sm text-green-800">
          Our support team is here to help you with domain setup and configuration.
        </p>
        <a
          href="mailto:support@cardwise.com"
          className="mt-3 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default DomainSetupGuide; 