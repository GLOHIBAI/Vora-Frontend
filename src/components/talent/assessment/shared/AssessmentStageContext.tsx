import React, { createContext, useContext } from 'react';

interface AssessmentStageContextValue {
  /** When true, the numbered circle badge (sequence) is hidden on AssessmentItemCard. */
  hideSequenceBadge: boolean;
}

const AssessmentStageContext = createContext<AssessmentStageContextValue>({
  hideSequenceBadge: false,
});

export const useAssessmentStageContext = () => useContext(AssessmentStageContext);

export const AssessmentStageProvider: React.FC<
  AssessmentStageContextValue & { children: React.ReactNode }
> = ({ hideSequenceBadge, children }) => (
  <AssessmentStageContext.Provider value={{ hideSequenceBadge }}>
    {children}
  </AssessmentStageContext.Provider>
);

export default AssessmentStageContext;
