// import { ConceptualModelInfo } from '@/pages';

// DataPropertyDomain(DPAK CA)
// HasKey(CA () (DPAK))
// DataPropertyRange(DPAK TAK)
// DataProperty(DPAK)
// FunctionalProperty(DPAK)

export function conceptualModelFunctions(ConceptualModelInfo: any) {
  function DataPropertyDomain(DPK: string, C: string) {
    const mappedC = ConceptualModelInfo.DP_domain_mapping[DPK];
    return mappedC == C;
  }

  function HasKey(C: string, DPK: string) {
    const domain = ConceptualModelInfo.DP_domain_mapping[DPK];
    return ConceptualModelInfo.DPKList.includes(DPK) && domain == C;
  }

  function DataPropertyRange(DPK: string, TK: string) {
    return TK == ConceptualModelInfo.DP_Range_mapping[DPK];
  }

  function DataProperty(DPK: string) {
    return (
      ConceptualModelInfo.FunctionalPropsList.includes(DPK) ||
      ConceptualModelInfo.DatatypePropsList.includes(DPK)
    );
  }

  function FunctionalProperty(DPK: string) {
    return ConceptualModelInfo.FunctionalPropsList.includes(DPK);
  }

  return {
    DataPropertyDomain,
    HasKey,
    DataPropertyRange,
    DataProperty,
    FunctionalProperty,
  };
}
