# (WIP) Auto Scaling Chat

# Setup

**Step 1.** Deploy api, fanout, and pubsub services 

```kubectl apply -f ./k8s```

**Step 2.** Install Minio

```
$ helm install -f ./helm/minio-values.yml \
  --set minio.accessKey=$MINIO_ACCESS_KEY \
  --set minio.secretKey=$MINIO_SECRET_KEY \
  --namespace=$OKTETO_NAMESPACE \
  storage okteto/minio
```

**Step 3.** Create a bucket named `static` with read * policy and bucket named `content` with a read-write * policy in minio.

**Step 4.** run the following and copy contents of the `dist` folder to the `static` bucket

```
$ cd frontend
$ npm build
$ cd ..
```