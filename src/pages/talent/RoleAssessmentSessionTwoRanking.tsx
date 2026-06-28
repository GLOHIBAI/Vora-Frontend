import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { SESSION_TWO_RANKING_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionTwoRanking: React.FC = () => (
  <MockAssessmentScreenView {...SESSION_TWO_RANKING_SCREEN} />
);

export default RoleAssessmentSessionTwoRanking;
