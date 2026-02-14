# MT法　反復
必要なインポート
```
import pandas as pd
import numpy as np
from scipy.stats import multivariate_normal
from scipy.stats import chi2
import matplotlib.pyplot as plt
```

MT法の適用。引数は単位空間データ、判定したい空間のデータ
判定ルールは自由度項目数ｐのχ２分布の右５％点
第一種の過誤である誤報率（正常を異常と判定）、検出力（異常を異常と判定）を出力できる。
```
class MT:
  def __init__(self,traindata,testdata):
    self.data=traindata
    self.testdata=testdata
    self.mu = None
    self.stt=None
    self.teststt=None
    self.sigma = None
    self.threshold = None
    self.corr=None
    self.min=None
    self.mahalanobis_dist=None
    self.mahalanobis_dist_test =None
    self.proportion=None
    self.testproportion=None

  def unitspace(self):
    self.mu = self.data.mean()
    self.sigma = self.data.std()
    self.stt=(self.data-self.mu)/self.sigma
    return self.stt
  def cor(self):
    self.corr=self.data.corr()
    self.min= np.linalg.inv(self.corr)
    return self.min
  def mh(self):
    if self.stt is None:
            self.unitspace()

    if self.corr is None:
            self.cor()

    self.mahalanobis_dist = []

    for row in self.stt.values:
      row = row.reshape(-1, 1)  # 行ベクトルを列ベクトルに変形
      distance = np.dot(row.T, np.dot(self.min, row))
      self.mahalanobis_dist.append(distance[0, 0])
    return self.mahalanobis_dist

  def plot_mahalanobis(self):
    if self.mahalanobis_dist is None:
      self.MH()
    x=np.arange(0, 5.3, 0.3)
    # 自由度5のカイ2乗分布を計算
    chi = chi2.pdf(x,self.data.shape[1])
    plt.plot(x, chi)
    plt.hist(self.mahalanobis_dist, bins=x,density=True)
    plt.xlabel('Mahalanobis Distance')
    plt.ylabel('Frequency')
    plt.title('Frequency of Mahalanobis Distances')
    plt.grid(True)
    plt.show()


    #test
  def unitspace_test(self):
    self.mu = self.data.mean()
    self.sigma = self.data.std()
    self.teststt=(self.testdata-self.mu)/self.sigma
    return self.teststt

    #MH_test
  def mh_test(self):
     if self.teststt is None:
            self.unitspace_test()

     if self.corr is None:
            self.cor()

     self.mahalanobis_dist_test = []

     for row in self.teststt.values:

      row = row.reshape(-1, 1)  # 行ベクトルを列ベクトルに変形
      distance = np.dot(row.T, np.dot(self.min, row))
      self.mahalanobis_dist_test.append(distance[0, 0])



     return self.mahalanobis_dist_test

  def mh_det(self):
    if self.mahalanobis_dist_test is None:
      self.mh_test()

    import scipy.stats as sps
    K=sps.chi2.ppf(q = 0.95, df = self.data.shape[1])
    count = sum(dist >= K for dist in self.mahalanobis_dist_test)
    self.testproportion = count / len(self.mahalanobis_dist_test)
    return self.testproportion

  def mh_sig(self):
    if self.mahalanobis_dist is None:
      self.mh()

    import scipy.stats as sps
    K=sps.chi2.ppf(q = 0.95, df = self.data.shape[1])
    count = sum(dist >= K for dist in self.mahalanobis_dist)
    self.proportion = count / len(self.mahalanobis_dist)
    return self.proportion
```
シミュレーションデータを使った繰り返し計算。
変数の数はいくらでもいいが、ここでは2変量正規乱数を作成。正常と異常データをプロットするとピッケルのような形になっている。
最終結果は誤報率と検出力
```

    #反復

rho_norm_train = 0.8
mu_train = [0, 0]
cov_train = [[1, rho_norm_train], [rho_norm_train, 1]]

rho_norm_test = -0.8
mu_test = [2,1]
cov_test = [[1, rho_norm_test], [rho_norm_test, 1]]
kens = []
gohous=[]
for i in range(100):
   traindata = pd.DataFrame(np.random.multivariate_normal(mu_train, cov_train, 100), columns=["x1", "x2"])
   testdata = pd.DataFrame(np.random.multivariate_normal(mu_test, cov_test, 100), columns=["x1", "x2"])

    
   mt = MT(traindata, testdata)

    
   ken= mt.mh_det()
   gohou = mt.mh_sig()
   kens.append(ken)
   gohous.append(gohou)


print(np.mean(kens))
print(np.mean(gohous))
```
