# 最小机器的多master kubeadm k8s集群
 架构图
                 |
                 V 
+------------------------+ OpenStack网络需特殊设置才
| vip  x.x.x.x           |  支持vip  
+------------------------+
|                                                   
|--master1 nodes etcd ceph  172.18.9.109
|--master2 nodes etcd ceph  172.18.9.110 
|--master3 nodes etcd ceph  172.18.9.111

## 1、kubeadm安装详见：https://kubernetes.io/docs/setup/independent/install-kubeadm/
docker 需要17.03版本
sudo yum install --setopt=obsoletes=0 \
     docker-ce-17.03.2.ce \
     docker-ce-selinux-17.03.2.ce
## 2、安装docker-compose：https://github.com/docker/compose/releases

## 3、导入镜像
docker load < ./image/images.tar
## 4、安装etcd集群
到master节点运行docker-compose up -d部署

## 5、设置hosts
172.18.9.109   k8s.master109
172.18.9.110   k8s.master110
172.18.9.111   k8s.master111

## 6、初始化k8s master
kubeadm init --config kubeadm-config.yml

#6.1 为了使用kubectl访问apiserver，在~/.bash_profile中追加下面的环境变量：
export KUBECONFIG=/etc/kubernetes/admin.conf
source ~/.bash_profile
#6.2 使master node参与工作负载
kubectl taint nodes --all  node-role.kubernetes.io/master-

#6.3 复制Master-1证书/etc/kubernetes/pki到Master02和Master03
kubeadm init --config kubernetes/kubeadm-conf.yaml

检查配置是否正确不正确修改/etc/kubernetes和/etc/kubernetes/manifests以下文件：
#Master02
sed -i 's/172.18.9.109:6443/172.18.9.110:6443/g' `grep 172.18.9.109:6443 . -rl`
sed -i 's/--advertise-address=172.18.9.109/--advertise-address=172.18.9.110/g' manifests/kube-apiserver.yaml
sed -i 's/host: 172.18.9.109/host: 172.18.9.110/g' manifests/kube-apiserver.yaml
或
kubeadm init --config kubeadm-config.yml

#Master03
sed -i 's/172.18.9.109:6443/172.18.9.111:6443/g' `grep 172.18.9.109:6443 . -rl`
sed -i 's/--advertise-address=172.18.9.109/--advertise-address=172.18.9.111/g' manifests/kube-apiserver.yaml
sed -i 's/host: 172.18.9.109/host: 172.18.9.111/g' manifests/kube-apiserver.yaml
或
kubeadm init --config kubeadm-config.yml

##7 安装calico网络插件详见https://docs.projectcalico.org/v3.2/getting-started/kubernetes/
使用了外部etcd，去掉etcd相关配置内容，并修改etcd_endpoints: [ETCD_ENDPOINTS]：
  etcd_endpoints: "http://10.96.232.136:6666" # 这里改成etcd集群地址如 "http://172.18.9.109:2379,http://172.18.9.110:2379,http://172.18.9.111:2379"

kubectl apply -f calico.yaml 

Azure和OpenStack可能会导致nodes间无法通讯3.2解决了这个问题https://github.com/projectcalico/calico/pull/1998/commits/7c2fa669c326584ad0476b13876e2aa6aafd0348
##7.1 设置calico管理工具（可选）
wget  https://github.com/projectcalico/calicoctl/releases/download/v2.0.0/calicoctl

mv calicoctl /usr/local/bin/ && chmod +x /usr/local/bin/calicoctl
执行命令
ETCD_ENDPOINTS=http://127.0.0.1:2379 calicoctl get profile
##7.2 iptables设置（可选）
# 开启forward
# Docker从1.13版本开始调整了默认的防火墙规则
# 禁用了iptables filter表中FOWARD链
# 这样会引起Kubernetes集群中跨Node的Pod无法通信

iptables -P FORWARD ACCEPT

##8 安装仪表板
kubectl apply -f kubernetes-dashboard.yaml

##9 创建共享存储详见
https://my.oschina.net/u/2306127/blog/1819630
https://rook.io/


##todo: 
1.命名空间的网络隔离
2.vip

## 其他：
根据文件创建configmap
kubectl create configmap example-redis-config --from-file=https://k8s.io/docs/tutorials/configuration/configmap/redis/redis-config
