import {
  DPKList,
  DP_Range_mapping,
  DP_domain_mapping,
  DatatypePropsList,
  FunctionalPropsList,
} from '@/pages';

// DataPropertyDomain(DPAK CA)
// HasKey(CA () (DPAK))
// DataPropertyRange(DPAK TAK)
// DataProperty(DPAK)
// FunctionalProperty(DPAK)

function DataPropertyDomain(DPK: string, C: string) {
  const mappedC = DP_domain_mapping[DPK];
  return mappedC == C;
}

function HasKey(C: string, DPK: string) {
  const domain = DP_domain_mapping[DPK];
  return DPKList.includes(DPK) && domain == C;
}

function DataPropertyRange(DPK: string, TK: string) {
  return TK == DP_Range_mapping[DPK];
}

function DataProperty(DPK: string) {
  return FunctionalPropsList.includes(DPK) || DatatypePropsList.includes(DPK);
}

function FunctionalProperty(DPK: string) {
  return FunctionalPropsList.includes(DPK);
}
