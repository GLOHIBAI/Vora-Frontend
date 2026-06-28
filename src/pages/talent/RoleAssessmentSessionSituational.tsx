import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { SITUATIONAL_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionSituational: React.FC = () => (
  <MockAssessmentScreenView {...SITUATIONAL_SCREEN} />
);

export default RoleAssessmentSessionSituational;
