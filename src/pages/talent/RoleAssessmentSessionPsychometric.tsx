import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { PSYCHOMETRIC_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionPsychometric: React.FC = () => (
  <MockAssessmentScreenView {...PSYCHOMETRIC_SCREEN} />
);

export default RoleAssessmentSessionPsychometric;
