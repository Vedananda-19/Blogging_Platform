import ProfileBlogList from "../components/ProfileBlogList";

const ProfileLikedPage = () => (
    <ProfileBlogList
        which="likedBlogs"
        title="Liked Blogs"
        subtitle="Posts you've liked"
        emptyText="You haven't liked any blogs yet."
    />
);

export default ProfileLikedPage;
