export interface BaziData {
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
  wuxing: Record<string, number>;
  rizhu: string;
  xiyongshen: string;
}

export interface ReportData {
  energyArchetype: string;
  lightAndShadow: string;
  currentResponse: string;
  actionPrescription: string;
}

export interface RedeemCodeValidation {
  success: boolean;
  message: string;
  remaining?: number;
}
