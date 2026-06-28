import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { SESSION_TWO_SITUATIONAL_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionTwoSituational: React.FC = () => (
  <MockAssessmentScreenView {...SESSION_TWO_SITUATIONAL_SCREEN} />
);

export default RoleAssessmentSessionTwoSituational;
