# (WIP) Auto Scaling Chat

# Setup

**Step 1.** Deploy pubsub and fanout services 

```kubectl apply -f ./k8s```

**Step 2.** Install OpenFAAS

```
$ helm install -f ./helm/openfaas-values.yml \
  --set openfaas.adminPassword=$OPENFAAS_PASSWORD \
  --set openfaas.functionNamespace=$OKTETO_NAMESPACE \
  --namespace=$OKTETO_NAMESPACE \
  api okteto/openfaas
```

**Step 3.** Build/Deploy all functions

```sudo faas-cli up -f ./api/stack.yml --namespace=$OKTETO_NAMESPACE```

**Step 4.** Install Minio

```
$ helm install -f ./helm/minio-values.yml \
  --set minio.accessKey=$MINIO_ACCESS_KEY \
  --set minio.secretKey=$MINIO_SECRET_KEY \
  --namespace=$OKTETO_NAMESPACE \
  storage okteto/minio
```

**Step 5.** Create a bucket named `static` with read * policy and bucket named `content` with a read-write * policy in minio.

**Step 6.** run the following and copy contents of the `dist` folder to the `static` bucket

```
$ cd frontend
$ npm build
$ cd ..
```