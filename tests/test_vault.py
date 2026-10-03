import io

def test_vault_item_crud_and_isolation(client):
    headers = {'X-User-ID': 'vault_user_789'}

    # 1. Reject unauthenticated requests
    assert client.get('/api/vault').status_code == 401

    # 2. Upload new vault item
    upload_data = {
        'images': (io.BytesIO(b'fake_image'), 'jacket.jpg'),
        'category': 'Outerwear'
    }
    create_res = client.post('/api/vault/upload', data=upload_data, headers=headers)
    assert create_res.status_code in (200, 201)
    
    item_id = create_res.json[0]['id']

    # 3. Update item description
    update_data = {'description': 'Vintage black denim jacket', 'category': 'Outerwear'}
    update_res = client.put(f'/api/vault/{item_id}', json=update_data, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json['description'] == 'Vintage black denim jacket'

    # 4. Fetch vault items and verify persistence
    get_res = client.get('/api/vault', headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json) == 1
    assert get_res.json[0]['id'] == item_id
    assert get_res.json[0]['description'] == 'Vintage black denim jacket'

    # 5. Verify user isolation (other users see an empty vault)
    other_headers = {'X-User-ID': 'other_user_000'}
    other_res = client.get('/api/vault', headers=other_headers)
    assert other_res.status_code == 200
    assert len(other_res.json) == 0