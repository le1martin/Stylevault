import io

def test_community_feed_includes_user_profile(client):
    # 1. Set up author profile
    user_headers = {'X-User-ID': 'author_123'}
    client.put('/api/profile', data={'display_name': 'Alex'}, headers=user_headers)

    # 2. Publish a community post with mock image data
    post_data = {
        'caption': 'Check out this fit!',
        'image': (io.BytesIO(b'fake_image'), 'fit.jpg')
    }
    post_res = client.post('/api/community/post', data=post_data, headers=user_headers)
    assert post_res.status_code == 200 or post_res.status_code == 201

    # 3. Fetch feed as a different user
    viewer_headers = {'X-User-ID': 'viewer_999'}
    feed_res = client.get('/api/community/feed', headers=viewer_headers)

    # 4. Verify response and profile data attachment
    assert feed_res.status_code == 200
    feed = feed_res.json
    assert len(feed) >= 1
    
    # Confirm post contains author profile details
    latest_post = feed[0]
    assert latest_post['caption'] == 'Check out this fit!'
    assert latest_post['display_name'] == 'Alex'