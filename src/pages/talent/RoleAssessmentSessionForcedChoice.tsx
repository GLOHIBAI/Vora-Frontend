import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { FORCED_CHOICE_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionForcedChoice: React.FC = () => (
  <MockAssessmentScreenView {...FORCED_CHOICE_SCREEN} />
);

export default RoleAssessmentSessionForcedChoice;
