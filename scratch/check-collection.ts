import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function checkCollection() {
    try {
        const collections = await pb.collections.getFullList();
        const materials = collections.find(c => c.name === 'materials');
        if (materials) {
            console.log("Collection 'materials' found.");
            console.log("List Rule:", materials.listRule);
            console.log("View Rule:", materials.viewRule);
            console.log("Fields:", materials.fields.map(f => `${f.name} (${f.type})`).join(", "));
        } else {
            console.log("Collection 'materials' NOT found!");
        }
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

checkCollection();
