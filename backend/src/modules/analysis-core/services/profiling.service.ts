import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfilingService {
  private readonly logger = new Logger(ProfilingService.name);

  /**
   * Profiles the project based on directory structure, configuration files, and extension stats.
   */
  profile(tempDir: string, filePaths: string[]): {
    projectType: string;
    languages: string[];
    frameworks: string[];
    packageManager: string;
    dependencies: Record<string, string>;
    configFilesContent: Record<string, string>;
  } {
    const extensionCounts: Record<string, number> = {};
    const configFilesContent: Record<string, string> = {};

    let detectedLanguages: string[] = [];
    let detectedFrameworks: string[] = [];
    let detectedDependencies: Record<string, string> = {};
    let detectedPackageManager = 'unknown';
    let projectType = 'Generic project';

    const extensionToLangMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript React',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.py': 'Python',
      '.go': 'Go',
      '.rs': 'Rust',
      '.java': 'Java',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.h': 'C/C++ Header',
      '.c': 'C',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.sh': 'Shell Script',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'Sass',
      '.json': 'JSON',
      '.yml': 'YAML',
      '.yaml': 'YAML',
    };

    // Gather extension counts and configuration contents
    for (const relPath of filePaths) {
      const item = path.basename(relPath);
      const ext = path.extname(item).toLowerCase();
      
      if (ext) {
        extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      } else {
        extensionCounts['[no extension]'] = (extensionCounts['[no extension]'] || 0) + 1;
      }

      const lowerItemName = item.toLowerCase();
      if ([
        'package.json', 'cargo.toml', 'go.mod', 'requirements.txt',
        'pom.xml', 'build.gradle', 'composer.json', 'gemfile', 'pyproject.toml'
      ].includes(lowerItemName)) {
        const fullPath = path.join(tempDir, relPath);
        try {
          // Read up to 20KB of config content to avoid blowing up token limits
          const content = fs.readFileSync(fullPath, 'utf8');
          configFilesContent[relPath] = content.slice(0, 20000);
        } catch (e: any) {
          this.logger.warn(`Failed to read config file ${relPath}: ${e.message}`);
        }
      }
    }

    // Sort languages by file counts
    const sortedExtensions = Object.entries(extensionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    detectedLanguages = sortedExtensions
      .map(([ext]) => extensionToLangMap[ext] || ext)
      .filter((v, i, self) => self.indexOf(v) === i);

    // Parse configuration file details
    for (const [relPath, content] of Object.entries(configFilesContent)) {
      const filename = path.basename(relPath).toLowerCase();
      if (filename === 'package.json') {
        try {
          const pkg = JSON.parse(content);
          projectType = 'NodeJS / JavaScript / TypeScript';
          detectedPackageManager = 'npm'; // default
          
          // Check for lockfiles to determine package manager in root of tempDir
          try {
            const filesInRoot = fs.readdirSync(tempDir);
            if (filesInRoot.includes('yarn.lock')) detectedPackageManager = 'yarn';
            else if (filesInRoot.includes('pnpm-lock.yaml')) detectedPackageManager = 'pnpm';
            else if (filesInRoot.includes('bun.lockb')) detectedPackageManager = 'bun';
          } catch (readdirErr) {
            // ignore
          }

          const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          detectedDependencies = { ...detectedDependencies, ...deps };

          // Extract frameworks
          if (deps['next']) detectedFrameworks.push('Next.js');
          if (deps['react']) detectedFrameworks.push('React');
          if (deps['@nestjs/core']) detectedFrameworks.push('NestJS');
          if (deps['express']) detectedFrameworks.push('Express');
          if (deps['vue']) detectedFrameworks.push('Vue.js');
          if (deps['@angular/core']) detectedFrameworks.push('Angular');
          if (deps['svelte']) detectedFrameworks.push('Svelte');
          if (deps['nuxt']) detectedFrameworks.push('Nuxt.js');
          if (deps['tailwindcss']) detectedFrameworks.push('TailwindCSS');
        } catch (e) {
          this.logger.warn(`Could not parse package.json: ${e}`);
        }
      } else if (filename === 'cargo.toml') {
        projectType = 'Rust Cargo';
        detectedPackageManager = 'cargo';
        if (!detectedLanguages.includes('Rust')) detectedLanguages.unshift('Rust');
      } else if (filename === 'go.mod') {
        projectType = 'Go Module';
        detectedPackageManager = 'go';
        if (!detectedLanguages.includes('Go')) detectedLanguages.unshift('Go');
      } else if (filename === 'requirements.txt' || filename === 'pyproject.toml') {
        projectType = 'Python Project';
        detectedPackageManager = 'pip/poetry';
        if (!detectedLanguages.includes('Python')) detectedLanguages.unshift('Python');
      }
    }

    // Deduplicate frameworks
    detectedFrameworks = Array.from(new Set(detectedFrameworks));

    return {
      projectType,
      languages: detectedLanguages,
      frameworks: detectedFrameworks,
      packageManager: detectedPackageManager,
      dependencies: detectedDependencies,
      configFilesContent,
    };
  }
}
