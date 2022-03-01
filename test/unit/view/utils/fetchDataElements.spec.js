
import fetchDataElements from "../../../../src/view/actions/utils/fetchDataElements";

describe("fetchDataElements", () => {
  fit("works", async () => {
    const orgId = "5BFE274A5F6980A50A495C08@AdobeOrg";
    const imsAccess = "eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE2NDU3NDI0ODc3MjVfMzBlMjQzMTYtYjJhYi00MGI5LWEzNGEtMGIwZjE0YzAzZTQ5X3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiIwYzFjNzQ3OGM0OTk0YzY5ODY2YjY0YzgzNDE1NzhlZCIsInVzZXJfaWQiOiI1MjIwMkVCOTYwMkYwMDREMEE0OTVGOENAdGVjaGFjY3QuYWRvYmUuY29tIiwic3RhdGUiOiJ7XCJzZXNzaW9uXCI6XCJodHRwczovL2ltcy1uYTEuYWRvYmVsb2dpbi5jb20vaW1zL3Nlc3Npb24vdjEvWWpSbE9XTmlZVGN0WXpkaE5pMDBORGd5TFRrM1ptVXROMkZqWVRsaFltVm1NMkkwTFMwMU1qSXdNa1ZDT1RZd01rWXdNRFJFTUVFME9UVkdPRU5BZEdWamFHRmpZM1F1WVdSdlltVXVZMjl0XCJ9IiwiYXMiOiJpbXMtbmExIiwiYWFfaWQiOiI1MjIwMkVCOTYwMkYwMDREMEE0OTVGOENAdGVjaGFjY3QuYWRvYmUuY29tIiwiY3RwIjowLCJmZyI6IldIRFpERzNKRkxFNUlQVUNFTVFGUkhRQVNBPT09PT09IiwibW9pIjoiNDFkNGExMzIiLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJzY29wZSI6Im9wZW5pZCxzZXNzaW9uLEFkb2JlSUQscmVhZF9vcmdhbml6YXRpb25zLGFkZGl0aW9uYWxfaW5mby5wcm9qZWN0ZWRQcm9kdWN0Q29udGV4dCIsImNyZWF0ZWRfYXQiOiIxNjQ1NzQyNDg3NzI1In0.Wlp64neVVc8OTrAL7Eeg6fEO5bvP4PjTPvhhWOZcVEYCxBzw9mCbjGcbZxAUOG904kPmEXRw83wCeMuljKqv_y0P67rn4zBRFLzU9pE8fqk87yfJZozY4_q-0oT5I85XRb7mhUbwHzMw_dmIlnpjhRbMHGQjXxiD0CkRI3izHhzhmeIjdJwPphcCyvgBZebuR4yjnND34GOqna4ZIDOK_fUTaT_y8JbMyFmnjK41NuOyzU8FQBxBL6dcVEYFXCVUq0fpsWiizTN-mwQOy3qxUJ2K3rMuQQwQdFaNDkhvIgN1ws6JzxgIpDN4BPIHF4CDYQlMRloTk_lYTuQ4r-aGug";
    const propertyId = "PRea0fe1ad20d14335a11f10ea10fb0a61";
    const delegateDescriptorId = "adobe-alloy::dataElements::xdm-object";

    const dataElements = await fetchDataElements({ orgId, imsAccess, propertyId, delegateDescriptorId });

    console.log(JSON.stringify(dataElements, null, 2));
  })
});
