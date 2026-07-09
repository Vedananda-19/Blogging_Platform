import ProfileBlogList from "../components/ProfileBlogList";

const ProfileCommentedPage = () => (
    <ProfileBlogList
        which="commentedBlogs"
        title="Your Comments"
        subtitle="Posts you've commented on"
        emptyText="You haven't commented on any blogs yet."
    />
);

export default ProfileCommentedPage;
