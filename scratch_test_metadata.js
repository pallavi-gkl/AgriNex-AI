const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kqmabbfjyrnvjcqkfxjy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function test() {
  console.log("Supabase Client initialized.");
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error);
    return;
  }
  console.log(`Found ${users.users.length} users.`);
  const consumer = users.users.find(u => u.user_metadata?.role === "consumer" || u.email?.includes("consumer"));
  if (consumer) {
    console.log("Consumer user found:", consumer.id, consumer.email);
    console.log("Current metadata:", consumer.user_metadata);

    // Let's test updating user metadata via admin client to see if it persists in DB
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      consumer.id,
      { user_metadata: { ...consumer.user_metadata, test_sync: "working_db_sync" } }
    );

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
    } else {
      console.log("User metadata updated successfully. New metadata:", updatedUser.user.user_metadata);
    }
  } else {
    console.log("No consumer user found to test.");
  }
}

test();
