export interface JenkinsResult {
  id: number;
  jobName: string;
  buildNumber: string;
  buildStatus: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  buildUrl: string;
  buildTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  testCases?: JenkinsTestCase[];
}

export interface JenkinsTestCase {
  id: number;
  testName: string;
  className: string;
  status: string;
  duration: number;
  errorMessage?: string;
  stackTrace?: string;
  createdAt: Date;
}

export interface JenkinsStatistics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
}

export interface JenkinsConnectionTest {
  connected: boolean;
  message: string;
}