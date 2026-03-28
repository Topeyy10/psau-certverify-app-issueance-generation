export interface CertificateData {
  validity: boolean;
  status: string;
  id: string;
  data: {
    id: string;
    holderName: string;
    issuer: string;
    issuanceDate: string;
  } | null;
}

export interface VerifyState {
  processing: boolean;
  displayResults: boolean;
  results: CertificateData | null;
  setProcessing: (value: boolean) => void;
  setResults: (data: CertificateData | null) => void;
  setDisplayResults: (value: boolean) => void;
  clearResults: () => void;
  hideDialog: () => void;
}
