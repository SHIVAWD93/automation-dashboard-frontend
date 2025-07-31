import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { JenkinsResult, JenkinsTestCase, JenkinsStatistics } from '../../models/jenkins.model';
import { Chart, registerables } from 'chart.js';
import { Tester } from '../../models/tester.model';

Chart.register(...registerables);

@Component({
  selector: 'app-jenkins-results',
  templateUrl: './jenkins-results.component.html',
  styleUrls: ['./jenkins-results.component.css']
})
export class JenkinsResultsComponent implements OnInit, OnDestroy {
  jenkinsResults: JenkinsResult[] = [];
  selectedJob: JenkinsResult | null = null;
  selectedJobTestCases: JenkinsTestCase[] = [];
  filteredTestCases: JenkinsTestCase[] = [];

  jenkinsStats: JenkinsStatistics = {
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0
  };

  loading = false;
  syncing = false;
  generating = false;
  connectionStatus = false;
  searchTerm = '';
  filteredResults: JenkinsResult[] = [];
  selectedStatus = '';
  showReport = false;
  testngReport: any = null;

  // Test case filtering
  testCaseSearchTerm = '';
  selectedTestCaseStatus = '';

  // Chart instances
  overallChart: Chart | null = null;
  jobChart: Chart | null = null;

  // Sorting
  currentSort = { column: '', direction: 'asc' };
  currentTestCaseSort = { column: '', direction: 'asc' };

  // Status filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'FAILURE', label: 'Failure' },
    { value: 'UNSTABLE', label: 'Unstable' },
    { value: 'ABORTED', label: 'Aborted' }
  ];

  // Test case status filter options
  testCaseStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PASSED', label: 'Passed' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'SKIPPED', label: 'Skipped' }
  ];

  testers: Tester[] = [];
  passPercentageThreshold: number = 0;
  automationTesterSelection: { [key: number]: number | null } = {};
  manualTesterSelection: { [key: number]: number | null } = {};
  jobNotes: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadJenkinsData();
    this.testConnection();
    this.loadTesters();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  async loadJenkinsData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadJenkinsResults(),
        this.loadJenkinsStatistics()
      ]);
      this.createOverallChart();
    } catch (error) {
      console.error('Error loading Jenkins data:', error);
    } finally {
      this.loading = false;
    }
  }

  loadJenkinsResults(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getJenkinsResults().subscribe(
        (data: JenkinsResult[]) => {
          this.jenkinsResults = data || [];
          this.applyFilters();
          resolve();
        },
        (error) => {
          console.error('Error loading Jenkins results:', error);
          this.jenkinsResults = [];
          this.applyFilters();
          reject(error);
        }
      );
    });
  }

  loadJenkinsStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getJenkinsStatistics().subscribe(
        (data: JenkinsStatistics) => {
          this.jenkinsStats = data;
          resolve();
        },
        (error) => {
          console.error('Error loading Jenkins statistics:', error);
          reject(error);
        }
      );
    });
  }

  testConnection(): void {
    this.apiService.testJenkinsConnection().subscribe(
      (response) => {
        this.connectionStatus = response.connected;
      },
      (error) => {
        console.error('Error testing Jenkins connection:', error);
        this.connectionStatus = false;
      }
    );
  }

  syncAllJobs(): void {
    this.syncing = true;
    this.apiService.syncJenkinsJobs().subscribe(
      (response) => {
        console.log('Sync successful:', response.message);
        this.loadJenkinsData();
        this.syncing = false;
      },
      (error) => {
        console.error('Sync failed:', error);
        this.syncing = false;
      }
    );
  }

  generateTestNGReport(): void {
    this.generating = true;
    this.apiService.syncAndGenerateJenkinsReport().subscribe(
      (response) => {
        console.log('Report generated successfully:', response.message);
        this.testngReport = response.report;
        this.showReport = true;
        this.loadJenkinsData(); // Refresh the data
        this.generating = false;
      },
      (error) => {
        console.error('Report generation failed:', error);
        this.generating = false;
      }
    );
  }

  closeReport(): void {
    this.showReport = false;
    this.testngReport = null;
  }

  syncSingleJob(jobName: string): void {
    this.apiService.syncSingleJenkinsJob(jobName).subscribe(
      (response) => {
        console.log('Job sync successful:', response.message);
        this.loadJenkinsData();
      },
      (error) => {
        console.error('Job sync failed:', error);
      }
    );
  }

  loadTesters(): void {
    this.apiService.getTesters().subscribe(
      (data: Tester[]) => this.testers = data,
      (error) => console.error('Error loading testers:', error)
    );
  }

  getPassPercentage(result: JenkinsResult): number {
    if (!result || !result.totalTests) {
      return 0;
    }
    return Math.round((result.passedTests / result.totalTests) * 100);
  }

  selectJob(job: JenkinsResult): void {
    this.selectedJob = job;
    this.jobNotes = (job.bugsIdentified || '') as string;
    this.loadJobTestCases(job.id);
  }

  loadJobTestCases(resultId: number): void {
    // First try to load from database
    this.apiService.getJenkinsTestCases(resultId).subscribe(
      (testCases: JenkinsTestCase[]) => {
        this.selectedJobTestCases = testCases || [];

        // If no test cases in database, try to fetch detailed TestNG results
        if (this.selectedJobTestCases.length === 0 && this.selectedJob) {
          this.loadDetailedTestNGResults(this.selectedJob.jobName, this.selectedJob.buildNumber);
        } else {
          this.applyTestCaseFilters();
          this.createJobChart();
        }
      },
      (error) => {
        console.error('Error loading test cases:', error);
        // Try to fetch detailed TestNG results as fallback
        if (this.selectedJob) {
          this.loadDetailedTestNGResults(this.selectedJob.jobName, this.selectedJob.buildNumber);
        }
      }
    );
  }

  loadDetailedTestNGResults(jobName: string, buildNumber: string): void {
    this.apiService.getDetailedJenkinsTestCases(jobName, buildNumber).subscribe(
      (response: any) => {
        if (response.testCases) {
          // Convert TestNG results to JenkinsTestCase format
          this.selectedJobTestCases = response.testCases.map((tc: any) => ({
            id: 0,
            testName: tc.testName,
            className: tc.className,
            status: this.normalizeTestStatus(tc.status),
            duration: tc.duration || 0,
            errorMessage: tc.errorMessage,
            stackTrace: tc.stackTrace,
            createdAt: new Date()
          }));

          // Update the selected job with correct counts
          if (this.selectedJob) {
            this.selectedJob.passedTests = response.passedCount || 0;
            this.selectedJob.failedTests = response.failedCount || 0;
            this.selectedJob.skippedTests = response.skippedCount || 0;
            this.selectedJob.totalTests = response.totalCount || 0;
          }
        } else {
          this.selectedJobTestCases = [];
        }
        this.applyTestCaseFilters();
        this.createJobChart();
      },
      (error) => {
        console.error('Error loading detailed TestNG results:', error);
        this.selectedJobTestCases = [];
        this.applyTestCaseFilters();
        this.createJobChart();
      }
    );
  }

  normalizeTestStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PASS':
      case 'PASSED':
        return 'PASSED';
      case 'FAIL':
      case 'FAILED':
        return 'FAILED';
      case 'SKIP':
      case 'SKIPPED':
        return 'SKIPPED';
      default:
        return status || 'UNKNOWN';
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTestCaseSearchChange(): void {
    this.applyTestCaseFilters();
  }

  onTestCaseStatusFilterChange(): void {
    this.applyTestCaseFilters();
  }

  applyFilters(): void {
    let filtered = this.jenkinsResults;

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(result => result.buildStatus === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.jobName.toLowerCase().includes(searchLower)
      );
    }

    if (this.passPercentageThreshold) {
      filtered = filtered.filter(r => this.getPassPercentage(r) >= this.passPercentageThreshold);
    }
    this.filteredResults = filtered;
  }

  applyTestCaseFilters(): void {
    let filtered = this.selectedJobTestCases;

    // Apply status filter
    if (this.selectedTestCaseStatus) {
      filtered = filtered.filter(testCase => testCase.status === this.selectedTestCaseStatus);
    }

    // Apply search filter
    if (this.testCaseSearchTerm.trim()) {
      const searchLower = this.testCaseSearchTerm.toLowerCase();
      filtered = filtered.filter(testCase =>
        testCase.testName.toLowerCase().includes(searchLower) ||
        testCase.className.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTestCases = filtered;
  }

  sortTable(column: string): void {
    if (this.currentSort.column === column) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.column = column;
      this.currentSort.direction = 'asc';
    }

    this.filteredResults.sort((a, b) => {
      let aVal: any = a[column as keyof JenkinsResult];
      let bVal: any = b[column as keyof JenkinsResult];

      // Handle different data types
      if (column === 'buildTimestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.currentSort.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  sortTestCases(column: string): void {
    if (this.currentTestCaseSort.column === column) {
      this.currentTestCaseSort.direction = this.currentTestCaseSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentTestCaseSort.column = column;
      this.currentTestCaseSort.direction = 'asc';
    }

    this.filteredTestCases.sort((a, b) => {
      let aVal: any = a[column as keyof JenkinsTestCase];
      let bVal: any = b[column as keyof JenkinsTestCase];

      // Handle different data types
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.currentTestCaseSort.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  getSortIcon(column: string): string {
    if (this.currentSort.column !== column) {
      return 'fas fa-sort';
    }
    return this.currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  getTestCaseSortIcon(column: string): string {
    if (this.currentTestCaseSort.column !== column) {
      return 'fas fa-sort';
    }
    return this.currentTestCaseSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  isSorted(column: string): boolean {
    return this.currentSort.column === column;
  }

  isTestCaseSorted(column: string): boolean {
    return this.currentTestCaseSort.column === column;
  }

  createOverallChart(): void {
    const ctx = document.getElementById('overallChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.overallChart) {
      this.overallChart.destroy();
    }

    const chartData = this.jenkinsResults.map(result => ({
      jobName: result.jobName,
      passed: result.passedTests || 0,
      failed: result.failedTests || 0,
      skipped: result.skippedTests || 0
    }));

    this.overallChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(data => data.jobName),
        datasets: [
          {
            label: 'Passed',
            data: chartData.map(data => data.passed),
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            borderWidth: 1
          },
          {
            label: 'Failed',
            data: chartData.map(data => data.failed),
            backgroundColor: '#dc3545',
            borderColor: '#c82333',
            borderWidth: 1
          },
          {
            label: 'Skipped',
            data: chartData.map(data => data.skipped),
            backgroundColor: '#ffc107',
            borderColor: '#e0a800',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Test Results by Job'
          }
        }
      }
    });
  }

  createJobChart(): void {
    const ctx = document.getElementById('jobChart') as HTMLCanvasElement;
    if (!ctx || !this.selectedJob) return;

    if (this.jobChart) {
      this.jobChart.destroy();
    }

    const passed = this.selectedJob.passedTests || 0;
    const failed = this.selectedJob.failedTests || 0;
    const skipped = this.selectedJob.skippedTests || 0;

    this.jobChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Skipped'],
        datasets: [{
          data: [passed, failed, skipped],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
          borderColor: ['#1e7e34', '#c82333', '#e0a800'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: `${this.selectedJob.jobName} - Build #${this.selectedJob.buildNumber}`
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = passed + failed + skipped;
                const percentage = total > 0 ? ((context.raw as number / total) * 100).toFixed(1) : '0';
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  destroyCharts(): void {
    if (this.overallChart) {
      this.overallChart.destroy();
      this.overallChart = null;
    }
    if (this.jobChart) {
      this.jobChart.destroy();
      this.jobChart = null;
    }
  }

  getBuildStatusColor(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-success';
      case 'FAILURE':
        return 'bg-danger';
      case 'UNSTABLE':
        return 'bg-warning';
      case 'ABORTED':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  }

  getTestStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PASSED':
        return 'text-success';
      case 'FAILED':
        return 'text-danger';
      case 'SKIPPED':
        return 'text-warning';
      default:
        return 'text-secondary';
    }
  }

  getTestStatusIcon(status: string): string {
    switch (status.toUpperCase()) {
      case 'PASSED':
        return 'fas fa-check-circle';
      case 'FAILED':
        return 'fas fa-times-circle';
      case 'SKIPPED':
        return 'fas fa-minus-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDuration(duration: number): string {
    if (duration < 1) {
      return `${(duration * 1000).toFixed(0)}ms`;
    } else {
      return `${duration.toFixed(2)}s`;
    }
  }

  // Added helper methods for template
  getPassedTestCasesCount(): number {
    return this.filteredTestCases.filter(tc => tc.status === 'PASSED').length;
  }

  getFailedTestCasesCount(): number {
    return this.filteredTestCases.filter(tc => tc.status === 'FAILED').length;
  }

  getSkippedTestCasesCount(): number {
    return this.filteredTestCases.filter(tc => tc.status === 'SKIPPED').length;
  }

  clearSelection(): void {
    this.selectedJob = null;
    this.selectedJobTestCases = [];
    this.filteredTestCases = [];
    this.testCaseSearchTerm = '';
    this.selectedTestCaseStatus = '';
    this.destroyCharts();
    setTimeout(() => this.createOverallChart(), 100);
  }

  assignTesters(result: JenkinsResult): void {
    const automationId = this.automationTesterSelection[result.id] ?? null;
    const manualId = this.manualTesterSelection[result.id] ?? null;
    if (automationId === null && manualId === null) {
      return;
    }
    this.apiService.assignTestersToJenkinsResult(result.id, automationId, manualId).subscribe(
      () => {
        if (automationId) {
          const tester = this.testers.find(t => t.id === automationId);
          if (tester) {
            result.automationTester = tester;
          }
        }
        if (manualId) {
          const tester = this.testers.find(t => t.id === manualId);
          if (tester) {
            result.manualTester = tester;
          }
        }
        // Clear selections
        this.automationTesterSelection[result.id] = null;
        this.manualTesterSelection[result.id] = null;
      },
      (error) => console.error('Error assigning testers:', error)
    );
  }

  saveJobNotes(): void {
    if (!this.selectedJob) { return; }
    const notes = { bugsIdentified: this.jobNotes, failureReasons: this.jobNotes };
    this.apiService.updateJenkinsJobNotes(this.selectedJob.id, notes).subscribe(
      () => {
        this.selectedJob!.bugsIdentified = this.jobNotes;
      },
      (error) => console.error('Error saving job notes:', error)
    );
  }
}