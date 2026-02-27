export interface Consultant {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  avatar?: string;
  availability: {
    [day: string]: { start: string; end: string }[];
  };
}
