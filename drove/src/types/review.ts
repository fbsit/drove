
export interface Review {
  id: string;
  rating: number;
  comment: string;
  clientName: string;
  clientAvatar?: string;
  droverName: string;
  transferId: string;
  createdAt: string;
  status: "nueva" | "vista" | "respondida";
  adminResponse?: string;
  adminResponseDate?: string;
  droverResponse?: string;
  droverResponseDate?: string;
  transferRoute: string;
  hasClientRead?: boolean;
}
