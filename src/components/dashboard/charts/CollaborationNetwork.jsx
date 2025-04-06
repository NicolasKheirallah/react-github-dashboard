// src/components/dashboard/charts/CollaborationNetwork.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import ForceGraph2D from 'react-force-graph-2d';

const CollaborationNetwork = () => {
  const { pullRequests, issues, userData } = useGithub();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const graphRef = useRef();
  
  useEffect(() => {
    if (pullRequests.length > 0 || issues.length > 0) {
      // Build collaboration network
      const allItems = [...pullRequests, ...issues];
      const collaboratorMap = {};
      const repoMap = {};
      
      // First, extract all unique collaborators and repos
      allItems.forEach(item => {
        const repoName = item.repository;
        if (!repoMap[repoName]) {
          repoMap[repoName] = {
            name: repoName,
            type: 'repo',
            count: 0
          };
        }
        repoMap[repoName].count++;
      });
      
      // Current user is the central node
      const username = userData?.login || 'you';
      collaboratorMap[username] = {
        name: username,
        type: 'user',
        count: allItems.length,
        isCurrentUser: true
      };
      
      // Build nodes array
      const nodes = [
        collaboratorMap[username],
        ...Object.values(repoMap)
      ];
      
      // Build links array - connect user to repos
      const links = Object.values(repoMap).map(repo => ({
        source: username,
        target: repo.name,
        value: repo.count
      }));
      
      setGraphData({ nodes, links });
    }
  }, [pullRequests, issues, userData]);
  
  const handleNodeHover = (node) => {
    if (!node) {
      setHoverNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    
    setHoverNode(node);
    
    // Highlight connected nodes and links
    const connectedNodes = new Set();
    const connectedLinks = new Set();
    
    connectedNodes.add(node);
    
    graphData.links.forEach(link => {
      if (link.source.name === node.name || link.target.name === node.name) {
        connectedLinks.add(link);
        connectedNodes.add(link.source);
        connectedNodes.add(link.target);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };
  
  // Calculate node size based on count (with limits for visual appeal)
  const getNodeSize = (node) => {
    if (node.isCurrentUser) return 15;
    const baseSize = node.type === 'repo' ? 8 : 6;
    const scale = Math.log(node.count + 1) / Math.log(10); // Logarithmic scale
    return baseSize + scale * 3;
  };
  
  // Get node color based on type
  const getNodeColor = (node) => {
    if (node.isCurrentUser) return '#8b5cf6'; // Purple for current user
    if (node.type === 'repo') return '#10b981'; // Green for repos
    return '#3b82f6'; // Blue for other users
  };
  
  return (
    <div className="w-full h-full">
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {graphData.nodes.length > 0 ? (
          <>
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeRelSize={8}
              nodeVal={getNodeSize}
              nodeColor={(node) => {
                if (highlightNodes.size > 0) {
                  return highlightNodes.has(node) ? getNodeColor(node) : '#cccccc';
                }
                return getNodeColor(node);
              }}
              linkWidth={(link) => highlightLinks.has(link) ? 2 : 1}
              linkColor={(link) => highlightLinks.has(link) ? '#666' : '#ddd'}
              nodeLabel={(node) => `${node.name} (${node.count} interactions)`}
              onNodeHover={handleNodeHover}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const size = getNodeSize(node);
                const fontSize = 12 / globalScale;
                const label = node.name.split('/').pop(); // Show only repo name without owner
                
                // Node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                ctx.fillStyle = highlightNodes.size > 0 && !highlightNodes.has(node) 
                  ? '#cccccc' 
                  : getNodeColor(node);
                ctx.fill();
                
                // Only render label if node is hovered or current user
                if (node === hoverNode || node.isCurrentUser || globalScale > 0.8) {
                  ctx.font = `${fontSize}px Inter`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = '#fff';
                  ctx.fillText(label, node.x, node.y);
                }
              }}
              cooldownTicks={100}
              onEngineStop={() => {
                // Fix central node position
                const centerNode = graphData.nodes.find(n => n.isCurrentUser);
                if (centerNode) {
                  centerNode.fx = 0;
                  centerNode.fy = 0;
                }
              }}
            />
            
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex items-center mb-1">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300">You</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300">Repositories</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Insufficient data to visualize network</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationNetwork;