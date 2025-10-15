// src/components/Lics/components/LicItem/types.ts

import { Lic } from "../../../../Store/licsStore";

export interface LicItemCounter {
  counterId:        string;
  code:             string;
  name:             string;
  number:           string;
  tip:              string;
  predIndice:       number;
  predPeriod:       string;
}

export interface LicItemDebt {
  id:               string;
  label:            string;
  sum:              number;
}


export interface LicItemProps {
  info:             Lic;
  ind:              number;
  setItem:          ( item: Lic )     => void;
  setPage:          ( page: number )  => void;
  delAccount:       ( code: string )  => void;
}