import { createContext, useContext } from 'react';

/** When true, Stage 2 reason fields may show red validation after Continue was attempted. */
const StageTwoValidationContext = createContext(false);

export const StageTwoValidationProvider = StageTwoValidationContext.Provider;

export const useShowStageTwoValidation = (): boolean =>
  useContext(StageTwoValidationContext);
