import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPasswordPage'
import CourseDetails from './pages/Course';
import ProfilePage from './pages/ProfilePage';
import Register from './pages/Register';
import SubmitSolutions from './pages/SubmitSolutions';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import GradesPage from './pages/Grades';
import CreateCourse from './pages/CreateCourse';
import CreateSubject from './pages/CreateSubject';
import Error403 from './pages/Error403';
import Error404 from './pages/Error404';
import EditCourse from './pages/EditCourse';
import ManageTask from './pages/ManageTask';
import GradeSubmissions from './pages/GradeSubmissions';
import CourseOverview from './pages/CourseOverview';
import CourseParticipants from './pages/CourseParticipants';
import GradeAnAssignment from './pages/GradeAnAssignment';
import AcceptInvitationPage from './pages/AcceptInvitationPage'

const App = () => (
  <AuthProvider>
      <Router>
          <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot' element={<ForgotPassword />} />
              <Route path="/reset-password/:token" component={ResetPasswordPage} />
              <Route path="/home" element={<ProtectedRoute element={Home} />} />
              <Route path="/course/:courseId" element={<ProtectedRoute element={CourseDetails} />} />
              <Route path="/profile/" element={<ProtectedRoute element={ProfilePage} />} />
              <Route path="/profile/:userId" element={<ProtectedRoute element={ProfilePage} />} />
              <Route path="/task/:taskId" element={<ProtectedRoute element={SubmitSolutions} />} />
              <Route path="/grades" element={<ProtectedRoute element={GradesPage} />} />
              <Route path="/create-course" element={<ProtectedRoute element={CreateCourse} />} />
              <Route path="/subjects" element={<ProtectedRoute element={CreateSubject} />} />
              <Route path="/403" element={<ProtectedRoute element={Error403} />} />
              <Route path="/edit-course/:courseId" element={<ProtectedRoute element={EditCourse} />} />
              <Route path="/manage-task/:courseId" element={<ProtectedRoute element={ManageTask} />} />
              <Route path="/grade-submissions/:taskId" element={<ProtectedRoute element={GradeSubmissions} />} />
              <Route path="/course-grades/:courseId" element={<ProtectedRoute element={CourseOverview} />} />
              <Route path="/course-participants/:courseId" element={<ProtectedRoute element={CourseParticipants} />} />
              <Route path="/grade-submissions/:taskId/:submissionId" element={<ProtectedRoute element={GradeAnAssignment} />} />
              <Route path="/accept-invitation/:token" element={<ProtectedRoute element={AcceptInvitationPage} />} />

              <Route path="/*" element={<ProtectedRoute element={Error404} />} />
          </Routes>
      </Router>
  </AuthProvider>
);

export default App;