import MockAssessmentScreenView from '../../components/talent/assessment/MockAssessmentScreenView';
import { READING_SCREEN } from '../../mocks/stage1AssessmentScreens';

const RoleAssessmentSessionReading: React.FC = () => (
  <MockAssessmentScreenView {...READING_SCREEN} />
);

export default RoleAssessmentSessionReading;
