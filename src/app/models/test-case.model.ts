export interface TestCase {
  id: number;
  title: string;
  description: string;
  projectId: number;
  testerId: number;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}
