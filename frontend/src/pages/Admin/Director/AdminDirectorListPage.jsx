import AdminActorListPage from '../Actor/AdminActorListPage';
import { getDirectorsAPI } from '../../../apis/personApi';

const AdminDirectorListPage = () => (
  <AdminActorListPage
    personRole="director"
    pageTitle="Quản lý Đạo diễn"
    pageSubtitle="Thêm, sửa, xóa đạo diễn trong hệ thống"
    fetchAPI={getDirectorsAPI}
  />
);

export default AdminDirectorListPage;
