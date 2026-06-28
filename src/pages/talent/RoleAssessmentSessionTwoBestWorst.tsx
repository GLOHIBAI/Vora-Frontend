import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { SESSION_TWO_BEST_WORST_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionTwoBestWorst: React.FC = () => (
  <MockAssessmentScreenView {...SESSION_TWO_BEST_WORST_SCREEN} />
);

export default RoleAssessmentSessionTwoBestWorst;
