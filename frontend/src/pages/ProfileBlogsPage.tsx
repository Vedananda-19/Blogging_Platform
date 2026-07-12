import ProfileBlogList from "../components/ProfileBlogList";

const ProfileBlogsPage = () => (
    <ProfileBlogList
        which="myBlogs"
        title="Your Blogs"
        subtitle="Posts you've written"
        emptyText="You haven't written any blogs yet."
        editable
    />
);

export default ProfileBlogsPage;
