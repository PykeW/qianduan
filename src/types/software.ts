export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  versions: Version[];
}

export interface Version {
  id: string;
  version: string;
  releaseDate: string;
  downloadUrl: string;
}

export type SoftwareCategory = string | undefined;