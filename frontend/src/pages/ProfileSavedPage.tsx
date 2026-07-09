import ProfileBlogList from "../components/ProfileBlogList";

const ProfileSavedPage = () => (
    <ProfileBlogList
        which="savedBlogs"
        title="Saved Blogs"
        subtitle="Posts you've saved"
        emptyText="You haven't saved any blogs yet."
    />
);

export default ProfileSavedPage;
