export interface Project {
  id: number;
  name: string;
  domainName: string;
  description: string;
  status: string;
  testCaseCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
