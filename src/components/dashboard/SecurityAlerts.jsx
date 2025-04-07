import React, { useState } from 'react';

const SecurityAlerts = ({ vulnerabilities }) => {
  const [filter, setFilter] = useState('all');
  
  // Process vulnerabilities data
  const processVulnerabilities = () => {
    if (!vulnerabilities || !vulnerabilities.alerts || !Array.isArray(vulnerabilities.alerts)) {
      return [];
    }
    
    const alerts = vulnerabilities.alerts.map(alert => {
      const severity = alert.security_advisory?.severity || 'unknown';
      const packageName = alert.security_vulnerability?.package?.name || 'Unknown package';
      const fixedIn = alert.security_vulnerability?.first_patched_version?.identifier || 'Not fixed yet';
      const currentVersion = alert.security_vulnerability?.vulnerable_version_range || 'Unknown version';
      const publishedAt = alert.security_advisory?.published_at 
        ? new Date(alert.security_advisory.published_at).toLocaleDateString()
        : 'Unknown date';
      
      return {
        id: alert.id || Math.random().toString(),
        title: alert.security_advisory?.summary || 'Unknown vulnerability',
        severity,
        severityLevel: getSeverityLevel(severity),
        packageName,
        fixedIn,
        currentVersion,
        publishedAt,
        description: alert.security_advisory?.description || 'No description available',
        url: alert.security_advisory?.references?.[0]?.url || '#'
      };
    });
    
    // Filter by severity if needed
    if (filter !== 'all') {
      return alerts.filter(alert => alert.severity === filter);
    }
    
    return alerts;
  };
  
  // Get severity level for sorting and styling
  const getSeverityLevel = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'moderate': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const alerts = processVulnerabilities();
  
  // Sort alerts by severity (highest first)
  const sortedAlerts = [...alerts].sort((a, b) => b.severityLevel - a.severityLevel);
  
  // Check if vulnerabilities are enabled
  const isEnabled = vulnerabilities && vulnerabilities.enabled !== false;
  
  // No data available
  if (!vulnerabilities) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Security Data Unavailable
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Security vulnerability data could not be loaded.
        </p>
      </div>
    );
  }
  
  // Vulnerabilities not enabled
  if (!isEnabled) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Security Alerts Not Enabled
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Vulnerability alerts are not enabled for this repository.
        </p>
        <a 
          href="https://docs.github.com/en/code-security/supply-chain-security/managing-vulnerabilities-in-your-projects-dependencies/about-alerts-for-vulnerable-dependencies"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Learn How to Enable
        </a>
      </div>
    );
  }
  
  // No alerts found
  if (sortedAlerts.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-green-400 mb-2">
          No Security Vulnerabilities Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          This repository doesn't have any known security vulnerabilities.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {sortedAlerts.length} Security {sortedAlerts.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Only</option>
          <option value="moderate">Moderate Only</option>
          <option value="low">Low Only</option>
        </select>
      </div>
      
      {/* Alerts */}
      <div className="space-y-4">
        {sortedAlerts.map(alert => (
          <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="border-l-4 border-red-500 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Package: <span className="font-semibold">{alert.packageName}</span> 
                    <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                    Current: <span className="font-semibold text-red-600 dark:text-red-400">{alert.currentVersion}</span>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                    Fixed in: <span className="font-semibold text-green-600 dark:text-green-400">{alert.fixedIn}</span>
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-block text-xs text-gray-500 dark:text-gray-400">
                    Published: {alert.publishedAt}
                  </span>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {alert.description}
                </p>
              </div>
              
              <div className="mt-4 flex">
                <a
                  href={alert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Advisory
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Resources section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
        <h4 className="text-md font-medium text-blue-900 dark:text-blue-300 mb-2">Security Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Supply Chain Security Documentation
          </a>
          <a 
            href="https://github.com/features/security"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            GitHub Security Features
          </a>
          <a 
            href="https://github.com/advisories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            GitHub Advisory Database
          </a>
          <a 
            href="https://nvd.nist.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            National Vulnerability Database
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;