from random import randint
import pytest
import httpx

# All fixtures (client, mock_enrollment) imported from conftest

def test_create_crop_policy(client, mock_enrollment):
    enrollment_data = {
        'sum_insured': 3600,
        'user_id': 42,
        'ic_company_id': 7,
        'receipt_no': 'RCPT123',
        'product_id': 1,
        'customer_id': 99,
        'cps_zone': 5
    }
    mock_enrollment(data=enrollment_data)

    response = client.post('/api/policy', json={'enrollment_id': 1})
    assert response.status_code == 200
    body = response.json()

    assert body['enrollment_id'] == 1
    assert body['user_id'] == 42
    assert body['ic_company_id'] == 7
    assert body['policy_no'] == 'RCPT123'
    assert body['status'] == 'pending'
    assert len(body['details']) == 36

    for detail in body['details']:
        assert detail['period_sum_insured'] == pytest.approx(3600 / 36)


def test_create_livestock_policy(client, mock_enrollment):
    enrollment_data = {
        'sum_insured': 1000,
        'user_id': 5,
        'ic_company_id': 3,
        'receipt_no': 'LS123',
        'product_id': 2,
        'customer_id': 10,
        'cps_zone': 12
    }
    mock_enrollment(data=enrollment_data)

    response = client.post('/api/policy', json={'enrollment_id': 2})
    assert response.status_code == 200
    body = response.json()

    assert body['status'] == 'pending'
    assert len(body['details']) == 2
    assert body['details'][0]['period'] == 1
    assert body['details'][1]['period'] == 2
    assert body['details'][0]['period_sum_insured'] == pytest.approx(1000 * 0.58)
    assert body['details'][1]['period_sum_insured'] == pytest.approx(1000 * 0.42)


def test_enrollment_service_error(client, mock_enrollment):
    mock_enrollment(error=httpx.HTTPError('Service down'))
    response = client.post('/api/policy', json={'enrollment_id': 3})
    assert response.status_code == 502
    assert 'Enrollment (DFS) service error' in response.json()['detail']


def test_invalid_enrollment_data(client, mock_enrollment):
    mock_enrollment(data={'sum_insured': None})
    response = client.post('/api/policy', json={'enrollment_id': 4})
    assert response.status_code == 400
    assert response.json()['detail'] == 'Invalid enrollment data'


@ pytest.mark.parametrize("action,expected_status", [
    ("approve", "approved"),
    ("reject", "rejected"),
])
def test_approve_and_reject(client, mock_enrollment, action, expected_status):
    enrollment_data = {
        'sum_insured': 200,
        'user_id': 1,
        'ic_company_id': 2,
        'receipt_no': 'ABC' + str(randint(1000, 9999)),
        'product_id': 2,
        'customer_id': 20,
        'cps_zone': 8
    }
    mock_enrollment(data=enrollment_data)
    create_resp = client.post('/api/policy', json={'enrollment_id': 5})
    policy_id = create_resp.json()['policy_id']

    response = client.post(f'/api/policy/{policy_id}/{action}')
    assert response.status_code == 200
    assert response.json()['status'] == expected_status


def test_get_and_list_policies_and_details(client, mock_enrollment):
    enc1 = {
        'sum_insured': 360,
        'user_id': 11,
        'ic_company_id': 22,
        'receipt_no': 'X1',
        'product_id': 1,
        'customer_id': 101,
        'cps_zone': 15
    }
    enc2 = {
        'sum_insured': 720,
        'user_id': 12,
        'ic_company_id': 23,
        'receipt_no': 'X2',
        'product_id': 2,
        'customer_id': 102,
        'cps_zone': 20
    }
    mock_enrollment(data=enc1)
    r1 = client.post('/api/policy', json={'enrollment_id': 6}).json()
    mock_enrollment(data=enc2)
    r2 = client.post('/api/policy', json={'enrollment_id': 7}).json()

    # GET single policy
    get1 = client.get(f"/api/policy/{r1['policy_id']}/")
    assert get1.status_code == 200
    assert get1.json()['policy_id'] == r1['policy_id']

    # GET policy details
    det1 = client.get(f"/api/policy/{r1['policy_id']}/details")
    assert det1.status_code == 200
    assert len(det1.json()) == 36

    # List policies
    lp = client.get('/api/policies')
    assert lp.status_code == 200
    assert isinstance(lp.json(), list)
    assert len(lp.json()) >= 2

    # List all policy details
    all_details = client.get('/api/policies/details')
    assert all_details.status_code == 200
    for d in all_details.json():
        assert 'policy_detail_id' in d
        assert 'customer_id' in d
        assert 'policy_id' in d
        assert 'period_sum_insured' in d
        assert 'cps_zone' in d
        assert 'product_type' in d


@pytest.mark.parametrize("method,endpoint", [
    ("get", "/api/policy/999"),
    ("get", "/api/policy/999/details"),
    ("post", "/api/policy/999/approve"),
    ("post", "/api/policy/999/reject"),
])
def test_not_found(client, method, endpoint):
    response = getattr(client, method)(endpoint)
    assert response.status_code == 404
    assert response.json()['detail'] == 'Policy not found'
