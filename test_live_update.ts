
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:8000/v1';
const API_KEY = process.env.API_KEY || 'test-api-key';

async function main() {
    console.log('--- Testing Live Sandbox Daemon Update ---');

    // 1. Create a Sandbox
    console.log('Creating sandbox...');
    const createRes = await axios.post(`${API_URL}/sandboxes`, {
        template_id: 'alpine',
        name: 'agent-update-test',
        vcpu_count: 1,
        mem_size_mib: 512,
    }, { headers: { 'x-api-key': API_KEY } });

    const sandboxId = createRes.data.id;
    console.log(`Sandbox created: ${sandboxId}`);

    // 2. Wait for it to start
    console.log('Waiting for sandbox to start...');
    for (let i = 0; i < 30; i++) {
        const sb = await axios.get(`${API_URL}/sandboxes/${sandboxId}`, { headers: { 'x-api-key': API_KEY } });
        if (sb.data.state === 'running') {
            console.log('Sandbox started!');
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    // 3. Confirm Daemon is active
    console.log('Checking sandboxd status (listing files)...');
    await axios.get(`${API_URL}/sandboxes/${sandboxId}/files/list?path=/tmp`, { headers: { 'x-api-key': API_KEY } });
    console.log('Sandboxd is active.');

    // 4. Trigger Update
    console.log('Triggering sandboxd update (syncing local sandboxd.py)...');
    try {
        await axios.post(`${API_URL}/sandboxes/${sandboxId}/daemon/update`, {}, { headers: { 'x-api-key': API_KEY } });
        console.log('Update triggered successfully.');
    } catch (e: any) {
        console.error('Update failed:', e.response?.data || e.message);
        return;
    }

    // 5. Verify it comes back up
    console.log('Verifying daemon restart (running echo)...');
    try {
        const execRes = await axios.post(`${API_URL}/sandboxes/${sandboxId}/execute`, {
            code: 'echo "I am alive after update!"'
        }, { headers: { 'x-api-key': API_KEY } });

        console.log('Execution result:', execRes.data.stdout.trim());
        if (execRes.data.stdout.includes('I am alive')) {
            console.log('SUCCESS: Daemon updated and restarted!');
        } else {
            console.error('FAILURE: Exec output mismatch.');
        }
    } catch (e: any) {
        console.error('Verification failed:', e.response?.data || e.message);
    }
}

main().catch(console.error);
