import React, { useEffect } from 'react';
import { useGithub } from '../../../context/GithubContext';

const DebugDataStructure = () => {
  const { repositories, pullRequests, contributions } = useGithub();
  
  useEffect(() => {
    // Debug the repository structure
    if (repositories && repositories.length > 0) {
      console.log('REPOSITORY STRUCTURE SAMPLE:');
      console.log(JSON.stringify(repositories[0], null, 2));
      
      // Check if repositories contain owner information
      const hasOwnerInfo = repositories.some(repo => repo && repo.owner && repo.owner.id);
      console.log(`Repositories with owner info: ${hasOwnerInfo ? 'YES' : 'NO'}`);
      
      // Check if repositories contain contributors array
      const hasContributors = repositories.some(repo => repo && repo.contributors && repo.contributors.length > 0);
      console.log(`Repositories with contributors array: ${hasContributors ? 'YES' : 'NO'}`);
    }
    
    // Debug pull request structure
    if (pullRequests && pullRequests.length > 0) {
      console.log('PULL REQUEST STRUCTURE SAMPLE:');
      console.log(JSON.stringify(pullRequests[0], null, 2));
      
      // Check if PRs contain user information
      const hasUserInfo = pullRequests.some(pr => pr && pr.user && pr.user.id);
      console.log(`PRs with user info: ${hasUserInfo ? 'YES' : 'NO'}`);
      
      // Check repository info in PRs
      const hasRepoInfo = pullRequests.some(pr => pr && pr.repository && pr.repository.name);
      console.log(`PRs with repository info: ${hasRepoInfo ? 'YES' : 'NO'}`);
      
      // Check base repo info in PRs
      const hasBaseRepoInfo = pullRequests.some(pr => pr && pr.base && pr.base.repo && pr.base.repo.name);
      console.log(`PRs with base.repo info: ${hasBaseRepoInfo ? 'YES' : 'NO'}`);
    }
    
    // Debug contributions structure
    if (contributions) {
      console.log('CONTRIBUTIONS STRUCTURE:');
      console.log(JSON.stringify(contributions, null, 2));
      
      // Check commits in contributions
      const hasCommits = contributions.commits && Array.isArray(contributions.commits) && contributions.commits.length > 0;
      console.log(`Contributions with commits: ${hasCommits ? 'YES' : 'NO'}`);
      
      if (hasCommits) {
        console.log('COMMIT STRUCTURE SAMPLE:');
        console.log(JSON.stringify(contributions.commits[0], null, 2));
        
        // Check if commits contain author information
        const hasAuthorInfo = contributions.commits.some(commit => commit && commit.author && commit.author.id);
        console.log(`Commits with author info: ${hasAuthorInfo ? 'YES' : 'NO'}`);
      }
    }
  }, [repositories, pullRequests, contributions]);
  
  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <p>Check the browser console for detailed data structure information.</p>
      <div className="mt-2 text-sm">
        <div>Repositories: {repositories ? repositories.length : 0}</div>
        <div>Pull Requests: {pullRequests ? pullRequests.length : 0}</div>
        <div>Contributions: {contributions && contributions.commits ? contributions.commits.length : 0} commits</div>
      </div>
    </div>
  );
};

export default DebugDataStructure;