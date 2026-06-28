import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { PSYCHOMETRIC_VALUES_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionPsychometricValues: React.FC = () => (
  <MockAssessmentScreenView {...PSYCHOMETRIC_VALUES_SCREEN} />
);

export default RoleAssessmentSessionPsychometricValues;
